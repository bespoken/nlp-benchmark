const _ = require('lodash')
const fs = require('fs')
const Fuse = require('fuse.js')
const { Interceptor } = require('bespoken-batch-tester')
const Question = require('./question')

// Turn the dataset into a map of questions
const dataset = fs.readFileSync('input/datasets/wikiqa.json')
const questions = {}
JSON.parse(dataset).questions.forEach(q => { questions[q.question] = Question.fromJSON(q) })

class BenchmarkInterceptor extends Interceptor {
  interceptResult (record, result) {
    // Get the original question this corresponds to
    const question = questions[record.meta.question.question]
    const transcript = result.lastResponse.transcript
    const answers = question.answers

    const display = _.join(_.get(result, 'lastResponse.card.content'), ' ')

    result.addOutputField('answers', answers.join(','))
    result.addOutputField('transcript', this.clean(result.lastResponse.transcript))
    // result.addOutputField('transcriptScore', transcriptScore)
    result.addOutputField('display', _.join(_.get(result, 'lastResponse.card.content'), ' '))

    // console.info(result.lastResponse.transcript)
    result.success = false

    if (this.includes(transcript, 'i don\'t know', 'I\'m not sure')) {
      result.success = false
    } else {
      for (const answer of answers) {
        result.success = this.checkAnswer(transcript, display, answer)
        if (result.success) {
          break
        }
      }
    }

    // result.addOutputField('displayScore', displayScore)
    result.addOutputField('imageURL', _.get(result, 'lastResponse.raw.imageURL'))
  }

  checkAnswer (transcript, display, answer) {
    let success = false
    const cleanAnswer = this.cleanAnswer(answer)
    const transcriptScore = this.search(transcript, cleanAnswer, 0.3)
    const displayScore = this.search(display, cleanAnswer, 0.3)

    if (this.includes(transcript, cleanAnswer)) {
      success = true
    } else if (this.includes(display, cleanAnswer)) {
      success = true
    } else if (transcriptScore < 0.3) {
      success = true
    } else if (displayScore < 0.3) {
      success = true
    }
    return success
  }

  cleanAnswer (s) {
    // Remove parentheses from the subject, as it confuses things
    // The part in paretheses seems to be for disambiguation
    if (s.indexOf('(')) {
      return s.split('(')[0].trim()
    }
    return s
  }

  search (s, includesPhrase, threshold) {
    if (!s) {
      return false
    }

    const options = {
      // includeMatches: true,
      includeScore: true,
      minMatchCharLength: 1
    }

    const fuse = new Fuse(s.split(' '), options)

    // Process each term in the includes phrase one by one
    const terms = includesPhrase.split(' ')
    let score = 0
    for (const term of terms) {
      const results = fuse.search(term)
      console.info('Result: ' + JSON.stringify(results, null, 2))
      if (results.length > 0) {
        score += results[0].score
      } else {
        score += 1
      }
    }
    return score / terms.length
  }

  includes (s, ...includesPhrases) {
    if (!s) {
      return false
    }

    for (const phrase of includesPhrases) {
      if (s.toLowerCase().includes(phrase.toLowerCase())) {
        return true
      }
    }
    return false
  }

  clean (s) {
    if (!s) {
      return s
    }

    return s.split('\n').join(' ')
  }
}

module.exports = BenchmarkInterceptor
// naturally formed caves
