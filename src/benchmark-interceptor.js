const _ = require('lodash')
const fs = require('fs')
const Fuse = require('fuse.js')
const { Interceptor } = require('bespoken-batch-tester')
const Question = require('./question')
const Util = require('./util')

class BenchmarkInterceptor extends Interceptor {
  interceptResult (record, result) {
    // Get the original question this corresponds to
    const question = record.meta.question
    const transcript = result.lastResponse.transcript
    const answers = question.answers

    const display = _.join(_.get(result, 'lastResponse.card.content'), ' ')

    result.addOutputField('ANSWERS', answers.map(a => a.value).join(','))
    result.addOutputField('TRANSCRIPT', this.clean(result.lastResponse.transcript))
    // result.addOutputField('transcriptScore', transcriptScore)
    result.addOutputField('DISPLAY', _.join(_.get(result, 'lastResponse.card.content'), ' '))
    result.addOutputField('PLATFORM', record.deviceTags[0])

    // console.info(result.lastResponse.transcript)
    result.success = false

    if (Util.includes(transcript, 'i don\'t know', 'I\'m not sure')) {
      result.success = false
    } else {
      // 1 is the worst score, 0 is the best
      // We take this system from our fuzzy search library
      let closest = {
        score: 1
      }
      for (const answer of answers) {
        const evaluation = this.checkAnswer(transcript, display, answer)
        // Save the closest answer
        if (!closest || evaluation.score < closest.score) {
          closest = evaluation
        }

        if (evaluation.matchType) {
          break
        }
      }

      result.success = closest.matchType !== undefined
      result.addOutputField('CLOSEST_ANSWER', closest.answer)
      result.addOutputField('CLOSEST_SCORE', closest.score)
      result.addOutputField('CLOSEST_MATCH', closest.matchType)
    }

    // result.addOutputField('displayScore', displayScore)
    result.addOutputField('IMAGE_URL', _.get(result, 'lastResponse.raw.imageURL'))
  }

  checkAnswer (transcript, display, answer) {
    const evaluation = {
      answer: answer.raw(),
      score: 1,
      matchType: undefined
    }
    const transcriptScore = this.search(transcript, answer)
    const displayScore = this.search(display, answer)

    if (answer.includes(transcript)) {
      evaluation.score = 0
      evaluation.matchType = 'TRANSCRIPT_INCLUDES'
    } else if (answer.includes(display)) {
      evaluation.score = 0
      evaluation.matchType = 'DISPLAY_INCLUDES'
    } else if (transcriptScore < 0.2) {
      evaluation.score = transcriptScore
      evaluation.matchType = 'TRANSCRIPT_FUZZY'
    } else if (displayScore < 0.2) {
      evaluation.score = displayScore
      evaluation.matchType = 'DISPLAY_FUZZY'
    }
    return evaluation
  }

  search (actualAnswer, expectedAnswer) {
    if (!actualAnswer) {
      return 1
    }

    const options = {
      // includeMatches: true,
      includeScore: true,
      minMatchCharLength: 1
    }

    const fuse = new Fuse(actualAnswer.split(' '), options)

    if (expectedAnswer.isDate()) {
      // Search for the year - we consider that passing
      if (Util.includes(actualAnswer, expectedAnswer.year())) {
        return 0
      } else {
        return 1
      }
    } else {
      // Process each term in the includes phrase one by one
      const expectedAnswerWords = expectedAnswer.text().split(' ')
      let score = 0
      // Check each expected word one-by-one
      for (const expectedAnswerWord of expectedAnswerWords) {
        // We do NOT do fuzzy matching on numbers
        if (Util.isNumber(expectedAnswerWord)) {
          let lowestScore = 1
          const expectedNumber = Util.toNumber(expectedAnswerWord)
          for (const actualWord of actualAnswer.split(' ')) {
            // If this word is a number, see how close it is to expected
            if (Util.isNumber(actualWord)) {
              const actualNumber = Util.toNumber(actualWord)
              const difference = Math.abs(expectedNumber - actualNumber) / expectedNumber
              if (difference < lowestScore) {
                lowestScore = difference
              }
            }
          }

          score += lowestScore
        } else {
          // Do a fuzzy match on the indivudal word
          const results = fuse.search(expectedAnswerWord)
          if (results.length > 0) {
            score += results[0].score
          } else {
            score += 1
          }
        }
      }
      return score / expectedAnswerWords.length
    }
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
