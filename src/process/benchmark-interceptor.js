const _ = require('lodash')
const AnnotationManager = require('../parse/annotation-manager')
const fs = require('fs')
const Fuse = require('fuse.js')
const { Config, Interceptor } = require('bespoken-batch-tester')
const Question = require('./question')
const Util = require('./util')

// We read back in the questions from our file, in case we have changed something in our logic
const questions = {}
const annotationManager = new AnnotationManager()

if (Config.has('sourceFile')) {
  const questionsString = fs.readFileSync(Config.get('sourceFile'))
  const questionsJSON = JSON.parse(questionsString)
  questionsJSON.questions.forEach(question => {
    questions[question.question] = Question.fromJSON(question)
  })

  // Add the annotations
  annotationManager.applyAnnotations(Object.values(questions), 'input/datasets/comqa-annotations.csv')
}

class BenchmarkInterceptor extends Interceptor {
  interceptPreProcess (job) {
    // Fix some early bad data
    if (job.run === 'nlp-benchmark_2020-07-24T19-28-12') {
      job.run = 'nlp-benchmark-alexa_2020-07-24T19-28-12'
    }

    if (job.name === 'nlp-benchmark') {
      job._name = 'nlp-benchmark-alexa'
    }
  }

  interceptRecord (record) {
    let utterance = record.utterance
    if (!utterance.includes('<speak>') && utterance.includes('alexa')) {
      utterance = _.replace(utterance, 'alexa', '<speak> alexa <break time="1s" />')
      utterance = utterance + ' </speak>'
    } else if (!utterance.includes('<speak>') && utterance.includes('google')) {
      utterance = _.replace(utterance, 'hey google', '<speak> hey google <break time="1s" />')
      utterance = utterance + ' </speak>'
    }

    if (utterance.includes(' us ')) {
      utterance = _.replace(utterance, ' us ', ' US ')
    }
    record.utterance = utterance
    return true
  }

  interceptResult (record, result) {
    // Get the original question this corresponds to
    let question = record.meta.question

    // If this a rerun, need to turn question JSON into an object
    if (record.rerun) {
      question = questions[question.question]
      if (!question) {
        return false
      }

      if (question.skip) {
        console.info('BMARK INTER skip question: ' + question.question)
        return false
      }
    }

    const transcript = _.get(result, 'lastResponse.transcript')
    const answers = question.answers

    const display = _.join(_.get(result, 'lastResponse.card.content'), ' ')

    result.addOutputField('ANSWERS', answers.map(a => a.text()).join(','))
    result.addOutputField('TRANSCRIPT', this.clean(transcript))
    result.addOutputField('DISPLAY', _.join(_.get(result, 'lastResponse.card.content'), ' '))

    // console.info(result.lastResponse.transcript)
    result.success = false

    // Handle questions that don't have answers - e.g., who was the first man to walk on Mars?
    if (question.hasNoAnswer()) {
      if (Util.includes(transcript, 'i don\'t know', 'I\'m not sure', 'I don\'t understand', '')) {
        result.success = true
      }

    // I don't know or I'm not sure means definitely did not get it
    } else if (Util.includes(transcript, 'i don\'t know', 'I\'m not sure')) {
      result.success = false

    // Evaluate the actual answer against the valid answer(s) - uses a scoring methodoloy based on fuzzy string comparison
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

    // Add the annotations
    for (const field of Object.keys(question.annotations)) {
      const value = question.annotations[field]
      result.addOutputField(field, value)
    }

    // result.addOutputField('displayScore', displayScore)
    result.addOutputField('IMAGE_URL', _.get(result, 'lastResponse.raw.imageURL'))
  }

  shouldRerunInteraction (record, responses) {
    const lastResponse = _.nth(responses, -1)
    // const card = _.join(_.get(lastResponse, 'card.content'))
    const rerun = false

    // if (!lastResponse || _.trim(lastResponse.transcript) === '') {
    //   rerun = true
    // // } else if (card.startsWith('What if')) {
    // //   rerun = true
    // // } else if (card.startsWith('What Should')) {
    // //   rerun = true
    // } else if (record.utterance.includes(' us ')) {
    //   rerun = true
    // } else if (record.utterance.includes(' us?')) {
    //   rerun = true
    // }

    return rerun
  }

  checkAnswer (transcript, display, answer) {
    const evaluation = {
      answer: answer.raw,
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
    } else if (transcriptScore < 0.4) {
      // Transcript is more lenient because of the errors in ASR
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
