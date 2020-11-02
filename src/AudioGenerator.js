const fs = require('fs')
const axios = require('axios')
const { Config } = require('bespoken-batch-tester')
const TTS = require('./tts')

class AudioGenerator {
  static async mergeAudios (prefix, recording) {
    const ffmpegToken = Config.env('FFMPEG_TOKEN')
    const prefixMessage = await TTS.textToSpeechPolly(prefix)
    const encodedPrefix = Buffer.from(prefixMessage).toString('base64')
    const encodedRecording = fs.readFileSync(recording).toString('base64')
    const jsonData = {
      command: 'ffmpeg -i prefix.pcm -i recording.wav -filter_complex \'[0:0][1:0]concat=n=2:v=0:a=1[out]\' -map \'[out]\' -f wav -',
      input: {
        'prefix.pcm': encodedPrefix,
        'recording.wav': encodedRecording
      }
    }

    try {
      const response = await axios.post('https://ffmpeg.bespoken.io', jsonData, {
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': ffmpegToken
        },
        responseType: 'json'
      })

      const { stdout } = response.data
      console.log(stdout)
      return stdout
    } catch (e) {
      console.error(e.message)
      return null
    }
  }
}

module.exports = AudioGenerator
