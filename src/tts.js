const AWS = require('aws-sdk')

class TTS {
  static async textToSpeechPolly (text) {
    const polly = new AWS.Polly({
      region: 'us-east-1'
    })

    const params = {
      Engine: 'standard',
      OutputFormat: 'pcm',
      SampleRate: '8000',
      Text: text,
      TextType: 'text',
      VoiceId: 'Joey'
    }

    if (text.includes('<speak>')) {
      params.TextType = 'ssml'
    }

    let response
    try {
      response = await polly.synthesizeSpeech(params).promise()
    } catch (er) {
      console.log(er)
    }
    return response.AudioStream
  }
}

module.exports = TTS
