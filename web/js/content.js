const Content = {
  'Answer Tuple': {
    content: `When an answer is a collection of related entities, rather than a single entity:<br><br>  
      
      <i>"When and where did George H. Bush go to college, and what did he study?"</i>`,
    title: 'Answer Tuple'
  },

  Comparison: {
    content: `There are three types of comparisons: 
      <ul>
        <li>Comparatives - <i>"Which players are taller than Wilt Chamberlain?"</i>
        <li>Superlatives - <i>"What is largest country in Europe?"</i>
        <li>Ordinal - <i>"What was the Pixies first album?"</i>
      </ul>`,
    title: 'Comparison Question'
  },

  Compositional: {
    content: `A question is compositional if combining answers to subquestions. These can be intersection or nested questions.<br><br>
      
      Intersection questions are ones where two or more subquestions can be answered independently, and their
      answers cross-referenced (<i>"Which films featuring Tom Hanks did Spielberg direct?"</i>).<br><br>
    
      In nested questions, it is necessary to answer one question before the other (<i>"Who were the
      parents of the lead singer of Thin Lizzy?</i>")`,
    title: 'Compositional Question'
  },

  'Grammatical Errors': {
    content: 'A question is categorized as having grammatical errors if the syntax is confusing or poorly phrased.',
    title: 'Grammatical Errors'
  },

  'Named Entities': {
    content: `The number of specific, named things in the question. Abraham Lincoln is a named entity - the 16th president is not.<br><br>

      The following example has two named entities:<br><br>

      <i>"What river flows France and Germany"</i>`,
    title: 'Unanswerable Questions'
  },

  'No Answer': {
    content: `Some questions can be based on a false premise, and hence, are unanswerable.<br><br>

      <i>"Who was the first human being on Mars?"</i>`,
    title: 'Unanswerable Questions'
  },

  Telegraphic: {
    content: `These are short questions formulated in an informal manner similar to keyword queries such as one enters in Google.<br><br>
    
      <i>"first president india"</i>.`,
    title: 'Telegraphic Questions'
  },

  Temporal: {
    content: `These are questions that require considering time to answer them:
      <ul>
        <li>Explicit - <i>"in 1975"</i>
        <li>Implicit - <i>"during the second world war"</i>
        <li>Relative - <i>"previous"</i>
      </ul>
      Additionally, questions that have a date/time as an answer are considered temporal:<br><br> 
      <i>"When did Trenton become New Jersey’s capital?"</i>.`,
    title: 'Temporal Reasoning Questions'
  },

  contentForKey: (key) => {
    for (const title of Object.keys(Content)) {
      if (key.toLowerCase() === title.toLowerCase()) {
        return Content[title].content
      }
    }
  },

  titleForKey: (key) => {
    for (const title of Object.keys(Content)) {
      if (key.toLowerCase() === title.toLowerCase()) {
        return Content[title].title
      }
    }
  }

}

window.Content = Content
