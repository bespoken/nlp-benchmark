const _ = require('lodash')
const fs = require('fs')
const parse = require('csv-parse/lib/sync')
const Question = require('../process/question')
const stringify = require('csv-stringify/lib/sync')

class AnnotationManager {
  createAnnotationSheet (filename) {
    const questions = this._readQuestions(filename)
    const annotations = []
    const headers = ['Question']
    for (const field of fields) {
      headers.push(field.name)
    }
    annotations.push(headers)
    for (const question of questions) {
      const annotation = [question.question]
      for (const field of fields) {
        if (field.name === 'No Answer') {
          annotation.push(question.hasNoAnswer() ? 'true' : 'false')
        } else {
          annotation.push(field.defaultValue)
        }
      }
      annotations.push(annotation)
    }

    const annotationContent = stringify(annotations, {
      headers: true
    })
    fs.writeFileSync('output/annotations.csv', annotationContent)
  }

  /**
   * Associate annotation data with questions
   * @param {Question[]} questions
   * @param {string} filename
   */
  applyAnnotations (questions, filename) {
    const annotations = this._readAnnotations(filename)
    console.info('Annotation count: ' + questions.length)
    for (const question of questions) {
      // Check if there are annotations for this question
      const annotationSet = annotations[question.question]

      // If there are annotations, add them to the question
      if (annotationSet) {
        for (const annotationField of Object.keys(annotationSet)) {
          const annotationValue = annotationSet[annotationField]
          question.addAnnotation(annotationField, annotationValue)
        }
      } else {
        console.info('No annotations for: ' + question.question)
      }
    }
  }

  /**
   * Reads annotations from a file and returns a map sorted by question
   * @param {string} filename
   */
  _readAnnotations (filename) {
    const annotationsData = fs.readFileSync(filename)
    const annotations = parse(annotationsData, {
      columns: true
    })

    // Turn it into a map by question
    const annotationMap = _.keyBy(annotations, 'Question')
    return annotationMap
  }

  _readQuestions (filename) {
    const contents = fs.readFileSync(filename)
    // JSON.parse(contents).questions.map(question => console.info(JSON.stringify(question)))// .question)
    const questions = JSON.parse(contents).questions.map(q => Question.fromJSON(q))
    return questions
  }
}

class Field {
  constructor (name, defaultValue) {
    this._name = name
    this._defaultValue = defaultValue
  }

  get defaultValue () {
    return this._defaultValue
  }

  get name () {
    return this._name
  }
}

const fields = [
  new Field('Answer Tuple', 'false'),
  new Field('Comparison', 'false'),
  new Field('Compositional', 'false'),
  new Field('Named Entities', 0),
  new Field('No Answer', 'false'),
  new Field('Telegraphic', 'false'),
  new Field('Temporal', 'false'),
  new Field('Topic'),
  new Field('Answer Type')
]

if (_.nth(process.argv, 2) === 'annotate') {
  const manager = new AnnotationManager()
  manager.createAnnotationSheet('input/datasets/comqa.json')
}

module.exports = AnnotationManager
