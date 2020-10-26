import AWS from 'aws-sdk'

class S3 {
  static async upload (buffer, name) {
    const s3 = new AWS.S3()
    const key = `${name}.wav`
    await s3
      .upload({
        Body: buffer,
        Bucket: 'ivr-benchmark-utterances',
        Key: key,
        ContentType: 'audio/wav'
      })
      .promise()
  }

  static getUrl (name) {
    const s3 = new AWS.S3()
    const url = s3.getSignedUrl('getObject', {
      Bucket: 'ivr-benchmark-utterances',
      Expires: 7 * 24 * 60 * 60, // TODO: should be less than one day
      Key: `${name}.wav`
    })
    return url
  }
}

module.exports = S3
