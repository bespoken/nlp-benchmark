const fs = require('fs')
const parse = require('csv-parse/lib/sync')
const _ = require('lodash')
const AudioGenerator = require('./AudioGenerator')
const S3 = require('./S3')
const { Config } = require('bespoken-batch-tester')
const axios = require('axios')
require('dotenv').config()

const fetchDataset = () => {
  const sourceFile = process.env.DATASET_PATH
  const data = fs.readFileSync(sourceFile, 'utf8')
  const dataset = parse(data, {
    delimiter: '\t',
    columns: true
  })

  // Generate a dataset combining the transcriptions for the same recordings
  const reducedDataset = dataset.reduce((finalDataset, row) => {
    if (Object.keys(finalDataset).includes(row.recordingid)) {
      finalDataset[row.recordingid].fullTranscript += ` ${row.transcription}`
    } else {
      finalDataset[row.recordingid] = {
        index: Object.keys(finalDataset).length
      }
      finalDataset[row.recordingid].fullTranscript = row.transcription
    }
    return finalDataset
  }, Object.create(null))
  return reducedDataset
}

const generateUtterances = async () => {
  const dataset = fetchDataset()
  for (const row in dataset) {
    const prefix = `Number: ${dataset[row].index + 1}. Expected Phrase:`
    console.info(prefix)
    const recording = `input/ivr/recordings/${row}.wav`
    const audio = await AudioGenerator.mergeAudios(prefix, recording)
    const audioBuffer = Buffer.from(audio, 'base64')
    await S3.upload(audioBuffer, row)
    console.info(`DONE ${dataset[row].index + 1}`)
  }
}

const addVirtualDeviceToken = (path) => {
  const input = fs.readFileSync(path)
  const data = JSON.parse(input)
  const token = { [process.env.VIRTUAL_DEVICE_TOKEN]: data.virtualDevices['<TwilioVirtualDeviceToken>'] }
  data.virtualDevices = { ...token }
  const finalInput = JSON.stringify(data, null, 2)
  fs.writeFileSync(path, finalInput)
}

const removeVirtualDeviceToken = (path) => {
  const input = fs.readFileSync(path)
  const data = JSON.parse(input)
  const token = { '<TwilioVirtualDeviceToken>': data.virtualDevices[process.env.VIRTUAL_DEVICE_TOKEN] }
  data.virtualDevices = { ...token }
  const finalInput = JSON.stringify(data, null, 2)
  fs.writeFileSync(path, finalInput)
}

// Got this here: https://github.com/TooTallNate/node-wav/blob/master/lib/writer.js
const pcmToWav = (buffer) => {
  const RIFF = Buffer.from('RIFF')
  const WAVE = Buffer.from('WAVE')
  const fmt = Buffer.from('fmt ')
  const data = Buffer.from('data')
  // TODO: 44 is only for format 1 (PCM), any other
  // format will have a variable size...
  const headerLength = 44

  const dataLength = buffer.length
  const fileSize = dataLength + headerLength
  const wavBuffer = Buffer.alloc(fileSize)
  let offset = 0

  // write the "RIFF" identifier
  RIFF.copy(wavBuffer, offset)
  offset += RIFF.length

  // write the file size minus the identifier and this 32-bit int
  wavBuffer.writeUInt32LE(fileSize - 12, offset)
  offset += 4

  // write the "WAVE" identifier
  WAVE.copy(wavBuffer, offset)
  offset += WAVE.length

  // write the "fmt " sub-chunk identifier
  fmt.copy(wavBuffer, offset)
  offset += fmt.length

  // write the size of the "fmt " chunk
  // XXX: value of 16 is hard-coded for raw PCM format. other formats have
  // different size.
  wavBuffer.writeUInt32LE(16, offset)
  offset += 4

  // write the audio format code
  wavBuffer.writeUInt16LE(1, offset)
  offset += 2

  // write the number of channels
  wavBuffer.writeUInt16LE(1, offset)
  offset += 2

  // write the sample rate
  wavBuffer.writeUInt32LE(8000, offset)
  offset += 4

  // write the byte rate
  const byteRate = 8000 * 1 * 16 / 8
  wavBuffer.writeUInt32LE(byteRate, offset)
  offset += 4

  // write the block align
  const blockAlign = 1 * 16 / 8
  wavBuffer.writeUInt16LE(blockAlign, offset)
  offset += 2

  // write the bits per sample
  wavBuffer.writeUInt16LE(16, offset)
  offset += 2

  // write the "data" sub-chunk ID
  data.copy(wavBuffer, offset)
  offset += data.length

  // write the remaining length of the rest of the data
  wavBuffer.writeUInt32LE(dataLength, offset)
  offset += 4

  // Add the audio to the WAV buffer
  buffer.copy(wavBuffer, 44)

  return wavBuffer
}

const ffmpeg = async (payload) => {
  const ffmpegToken = Config.env('FFMPEG_TOKEN')
  try {
    const response = await axios.post('https://ffmpeg.bespoken.io', payload, {
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': ffmpegToken
      },
      responseType: 'json'
    })

    const { stdout } = response.data
    // console.log(stdout)
    return stdout
  } catch (e) {
    console.error(e.message)
    return null
  }
}

const mergeAudios = async (audio1, audio2) => {
  const jsonData = {
    command: 'ffmpeg -i audio1.wav -i audio2.wav -filter_complex \'[0:0][1:0]concat=n=2:v=0:a=1[out]\' -map \'[out]\' -f wav -',
    input: {
      'audio1.wav': Buffer.from(audio1).toString('base64'),
      'audio2.wav': Buffer.from(audio2).toString('base64')
    }
  }
  return await ffmpeg(jsonData)
}

module.exports = {
  fetchDataset,
  pcmToWav,
  ffmpeg,
  mergeAudios
}

if (_.nth(process.argv, 2) === 'generate') {
  generateUtterances().then(() => {
    console.log('DONE')
  }).catch(er => console.log(er))
}

if (_.nth(process.argv, 2) === 'addToken') {
  const path = _.nth(process.argv, 3)
  addVirtualDeviceToken(path)
}

if (_.nth(process.argv, 2) === 'removeToken') {
  const path = _.nth(process.argv, 3)
  removeVirtualDeviceToken(path)
}
