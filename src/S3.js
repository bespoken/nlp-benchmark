const AWS = require('aws-sdk')

class S3 {
  static async upload (key, buffer, bucket = 'ivr-benchmark-utterances') {
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
        Bucket: bucket,
        Key: key,
        ContentType: contentType
      })
      .promise()
  }

  static getUrl (name, bucket = 'ivr-benchmark-utterances') {
    const s3 = new AWS.S3()
    const url = s3.getSignedUrl('getObject', {
      Bucket: bucket,
      Expires: 7 * 24 * 60 * 60, // TODO: should be less than one day
      Key: name
    })
    return url
  }

  static async get (key, bucket = 'ivr-benchmark-utterances') {
    const s3 = new AWS.S3()
    const object = await s3.getObject({
      Bucket: bucket,
      Key: key
    }).promise()
    return object.Body
  }
}

module.exports = S3
