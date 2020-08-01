const mysql = require('proims-mysql')

class DataSource {
  constructor () {

  }

  async connection () {
    if (!this._connection) {
      this._connection = await mysql.createConnection({
        database: process.env.MYSQL_DATABASE,
        host: process.env.MYSQL_HOST,
        password: process.env.MYSQL_PASSWORD,
        user: process.env.MYSQL_USER
      })
    }
    return this._connection
  }

  async results (query) {
    const connection = this.connection()
    const resultArray = connection.query(query)
    const results = resultArray[0]
    return results
  }
}

module.exports = DataSource
