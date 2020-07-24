const _ = require('lodash')

module.exports = {
  includes (s, ...phrases) {
    if (!s) {
      return false
    }

    console.info('I includesphrases: ' + phrases.join(','))
    for (const phrase of phrases) {
      if (s.toLowerCase().includes(phrase.toString().toLowerCase())) {
        return true
      }
    }
    return false
  },

  isNumber: (s) => {
    return !isNaN(_.toNumber(s.replace(/,/g, '')))
  },

  toNumber: (s) => {
    return _.toNumber(s.replace(/,/g, ''))
  }
}
