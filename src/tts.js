const AWS = require('aws-sdk')

class TTS {
  static async textToSpeechPolly (text) {
    const polly = new AWS.Polly({
      region: 'us-east-1'
    })

    const params = {
      Engine: 'standard',
      OutputFormat: 'pcm',
      SampleRate: '16000',
      Text: text,
      TextType: 'text',
      VoiceId: 'Joey'
    }

    if (text.includes('<speak>')) {
      params.TextType = 'ssml'
    }

    const response = await polly.synthesizeSpeech(params).promise()
    return response.AudioStream
  }
}

module.exports = TTS
