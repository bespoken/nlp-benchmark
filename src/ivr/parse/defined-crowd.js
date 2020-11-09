const _ = require('lodash')
const S3 = require('../../S3')
const TTS = require('../../tts')
const { ffmpeg, pcmToWav, mergeAudios } = require('./../../helper')
const parse = require('csv-parse/lib/sync')
require('dotenv').config()

class DefinedCrowd {
  constructor () {
    this.languageCode = process.env.LANGUAGE_CODE || 'en-us'
    this.executionPrefix = Date.now()
  }

  async getDataset () {
    return JSON.parse(await S3.get('proccesed-recordings.json', 'ivr-benchmark-defined-crowd'))
  }

  async process () {
    const transcriptions = `${this.languageCode}/transcriptions/${this.languageCode}_transcriptions.tsv`
    const sourceFile = await S3.get(transcriptions, 'ivr-benchmark-defined-crowd')
    const dataset = parse(sourceFile, {
      delimiter: '\t',
      columns: true
    })
    const rowToTranscript = row => ({
      transcription: row.transcription,
      startTime: row.start_time,
      endTime: row.end_time
    })
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
      const recordingKey = `${this.languageCode}/recordings/${recordingId}.wav`
      console.info(`Defined Crowd: processing ${recordingKey}`)
      const recording = await S3.get(recordingKey, 'ivr-benchmark-defined-crowd')
      const proccesedRecording = await this.processRecording(recording, reducedDataset[recordingId].transcripts)
      console.info(`Defined Crowd: uploading files ${proccesedRecording.length}`)

      for (const i in proccesedRecording) {
        const key = `${this.languageCode}/processed/${recordingId}-${i}.wav`
        const audioBuffer = Buffer.from(proccesedRecording[i].buffer, 'base64')
        console.info(`Defined Crowd: uploading ${key} audio`)
        await S3.upload(key, audioBuffer, 'ivr-benchmark-defined-crowd')
        finalDataset.push({
          key,
          transcript: reducedDataset[recordingId].transcripts[i].transcription,
          recording: recordingId,
          startTime: reducedDataset[recordingId].transcripts[i].startTime,
          endTime: reducedDataset[recordingId].transcripts[i].endTime
        })
      }
    }
    console.info('Defined Crowd: uploading proccesed-recordings.json')
    await S3.upload(`${this.languageCode}/proccesed-recordings.json`, JSON.stringify(finalDataset), 'ivr-benchmark-defined-crowd')
  }

  async processRecording (fileBuffer, transcripts) {
    console.debug(`starting processRecording transcripts: ${JSON.stringify(transcripts)}`)
    if (!transcripts || transcripts.length === 0) {
      return []
    }

    const mapChannelPayload = {
      command: 'ffmpeg -i recording.wav -map_channel 0.0.0 -f wav -',
      input: {
        'recording.wav': fileBuffer
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
    return results
  }

  async getUrl (proccesedRecord, prefix) {
    let bucket = 'ivr-benchmark-defined-crowd'
    let key = proccesedRecord.key
    if (prefix) {
      const prefixSsml = `<speak><break time='200ms'/>${prefix}</speak>`
      const prefixAudio = await TTS.textToSpeechPolly(prefixSsml)
      const prefixBuffer = pcmToWav(Buffer.from(prefixAudio, 'base64'))
      const audio = await S3.get(key, 'ivr-benchmark-defined-crowd')
      const merged = await mergeAudios(prefixBuffer, audio)
      const mergedBuffer = Buffer.from(merged, 'base64')
      const fileName = proccesedRecord.key.substr(proccesedRecord.key.lastIndexOf('/') + 1)
      key = `${this.executionPrefix}-${fileName}`
      bucket = 'ivr-benchmark-utterances'
      await S3.upload(key, mergedBuffer)
    }
    return S3.getUrl(key, bucket)
  }
}

module.exports = {
  DefinedCrowd
}

if (_.nth(process.argv, 2) === 'parse') {
  const recording = new DefinedCrowd()
  recording.process().then(() => console.log('Done!'))
}
