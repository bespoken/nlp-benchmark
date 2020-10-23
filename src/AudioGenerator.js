const axios = require('axios')
const { Config } = require('bespoken-batch-tester')
const TTS = require('./tts')

class AudioGenerator {
  static async mergeAudios (prefix, clip) {
    const ffmpegToken = Config.env('FFMPEG_TOKEN')
    const prefixMessage = await TTS.textToSpeechPolly(prefix)
    const encodedPrefix = prefixMessage.toString('base64')
    const encodedClip = clip.toString('base64')
    const jsonData = {
      command: 'ffmpeg -i prefix.mp3 -i clip.mp3 -filter_complex \'[0:0][1:0]concat=n=2:v=0:a=1[out]\' -map \'[out]\' -f wav -',
      input: {
        'prefix.mp3': encodedPrefix,
        'clip.mp3': encodedClip
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

      const { stderr } = response.data
      console.log(stderr)
      return stderr
    } catch (e) {
      console.error(e.message)
      return null
    }
  }
}

module.exports = AudioGenerator
