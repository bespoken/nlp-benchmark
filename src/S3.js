const AWS = require('aws-sdk')

class S3 {
  static async upload (buffer, key) {
    const s3 = new AWS.S3()
    let contentType
    if (key.endsWith('jpg') || key.endsWith('jpeg')) {
      contentType = 'image/jpeg'
    } else if (key.endsWith('png')) {
      contentType = 'image/png'
    } else if (key.endsWith('wav')) {
      contentType = 'audio/wav'
    } else if (key.endsWith('txt')) {
      contentType = 'text/plain'
    } else if (key.endsWith('json')) {
      contentType = 'application/json'
    }

    await s3
      .upload({
        Body: buffer,
        Bucket: 'ivr-benchmark-utterances',
        Key: key,
        ContentType: contentType
      })
      .promise()
  }

  static getUrl (name) {
    const s3 = new AWS.S3()
    const url = s3.getSignedUrl('getObject', {
      Bucket: 'ivr-benchmark-utterances',
      Expires: 7 * 24 * 60 * 60, // TODO: should be less than one day
      Key: name
    })
    return url
  }

  static async get (key) {
    const s3 = new AWS.S3()
    const object = await s3.getObject({
      Bucket: 'ivr-benchmark-utterances',
      Key: key
    }).promise()
    return object.Body
  }
}

module.exports = S3
