const mysql = require('promise-mysql')

class DataSource {
  async connection () {
    console.time('DATASOURCE CONNECTION')
    const connection = await mysql.createConnection({
      database: process.env.MYSQL_DATABASE,
      host: process.env.MYSQL_HOST,
      password: process.env.MYSQL_PASSWORD,
      user: process.env.MYSQL_USER
    })
    console.timeEnd('DATASOURCE CONNECTION')
    return connection
  }

  async results (query) {
    let connection
    try {
      connection = await this.connection()
      const results = await connection.query(query)
      return results
    } finally {
      try {
        await connection.destroy()
      } catch (e) {
        console.error('DATASOURCE RESULTS error closing connection: ' + e)
      }
    }
  }
}

module.exports = DataSource
