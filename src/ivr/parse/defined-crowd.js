const _ = require('lodash')
const S3 = require('../../S3')
const TTS = require('../../tts')
const fs = require('fs')
const { ffmpeg, pcmToWav, mergeAudios } = require('./../../helper')
const parse = require('csv-parse/lib/sync')
require('dotenv').config()

class DefinedCrowdRecording {
  async process (includePrefix = false) {
    const dataset = JSON.parse(await S3.get('proccesed-recordings.json'))
    for (const row in dataset) {
      if (includePrefix) {
        const prefix = `Number: ${parseInt(row + 1)}. Expected Phrase:`
        const prefixMessage = await TTS.textToSpeechPolly(prefix)
        console.info(`prefixMessage ${prefix}`)
        const prefixBuffer = pcmToWav(Buffer.from(prefixMessage, 'base64'))
        const audio = await S3.get(dataset[row].key)
        const merged = await mergeAudios(prefixBuffer, audio)
        const mergedBuffer = Buffer.from(merged, 'base64')
        // TODO
        await S3.upload(mergedBuffer, 'test.wav')
      }
      console.info(`DONE ${row + 1}`)
      break
    }
  }

  async preProcess () {
    const sourceFile = process.env.DATASET_PATH
    const data = fs.readFileSync(sourceFile, 'utf8')
    const dataset = parse(data, {
      delimiter: '\t',
      columns: true
    })
    const rowToTranscript = row => ({
      transcription: row.transcription,
      startTime: row.start_time,
      endTime: row.end_time
    })
    // Generate a dataset combining the transcriptions for the same recordings
    const reducedDataset = dataset.reduce((finalDataset, row) => {
      if (Object.keys(finalDataset).includes(row.recordingid)) {
        finalDataset[row.recordingid].transcripts.push(rowToTranscript(row))
      } else {
        finalDataset[row.recordingid] = {
          transcripts: [rowToTranscript(row)]
        }
      }
      return finalDataset
    }, Object.create(null))

    const finalDataset = []
    for (const recordingId in reducedDataset) {
      const path = `./input/ivr/recordings/${recordingId}.wav`
      const proccesedRecording = await this.processRecording(path, reducedDataset[recordingId].transcripts)
      console.log(`starting uploading files ${proccesedRecording.length}`)
      for (const i in proccesedRecording) {
        const key = `${recordingId}-${i}.wav`
        const audioBuffer = Buffer.from(proccesedRecording[i].buffer, 'base64')
        console.log(`uploading ${key}`)
        await S3.upload(key, audioBuffer)
        finalDataset.push({
          key,
          transcript: reducedDataset[recordingId].transcripts[i].transcription,
          recording: recordingId,
          startTime: reducedDataset[recordingId].transcripts[i].startTime,
          endTime: reducedDataset[recordingId].transcripts[i].endTime
        })
      }
    }
    await S3.upload('proccesed-recordings.json', JSON.stringify(finalDataset))
    console.log(finalDataset)
  }

  async processRecording (filePath, transcripts) {
    console.debug(`starting processRecording ${filePath}, transcripts: ${JSON.stringify(transcripts)}`)
    if (!transcripts || transcripts.length === 0) {
      return []
    }
    const recording = fs.readFileSync(filePath).toString('base64')

    const mapChannelPayload = {
      command: 'ffmpeg -i recording.wav -map_channel 0.0.0 -f wav -',
      input: {
        'recording.wav': recording
      }
    }
    const results = []
    const monoRecording = await ffmpeg(mapChannelPayload)
    for (const transcript of transcripts) {
      console.debug(`starting processTranscript ${JSON.stringify(transcript)}`)
      const command = `ffmpeg -i recording.wav -ss ${transcript.startTime} -to ${transcript.endTime} -f wav -`
      const splitPayload = {
        command,
        input: {
          'recording.wav': Buffer.from(monoRecording, 'base64')
        }
      }
      const splitted = await ffmpeg(splitPayload)
      results.push({
        buffer: splitted
      })
      console.debug('processTranscript completed')
    }
    console.debug(`completed processRecording ${filePath}`)
    return results
  }
}

module.exports = {
  DefinedCrowdRecording
}

if (_.nth(process.argv, 2) === 'process') {
  const recording = new DefinedCrowdRecording()
  recording.process(true)
}
