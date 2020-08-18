const Content = {
  'Answer Tuple': {
    content: `Where an answer is a tuple of connected entities as opposed to a single entity.<br><br>  
      
      <i>"When and where did George H. Bush go to college, and what did he study?"</i>`,
    title: 'Answer Tuple'
  },

  Comparison: {
    content: `We consider three types of comparison questions: 
      <ul>
        <li>Comparatives - <i>"Which rivers in Europe are longer than the Rhine?"</i>
        <li>Superlatives - <i>"What is the population of the largest city in Egypt?"</i>
        <li>Ordinal - <i>"What was the name of Elvis’s first movie?"</i>
      </ul>`,
    title: 'Comparison Question'
  },

  Compositional: {
    content: `A question is compositional if answering it requires answering more primitive
      questions and combining these. These can be intersection or nested questions.<br><br>
      
      Intersection questions are ones where two or more subquestions can be answered independently, and their
      answers intersected (<i>"Which films featuring Tom Hanks did Spielberg direct?"</i>).<br><br>
    
      In nested questions, the answer to one subquestion is necessary to answer another (<i>"Who were the
      parents of the thirteenth president of the US?</i>")`,
    title: 'Compositional Question'
  },

  'Grammatical Errors': {
    content: 'A question is categorized as having grammatical errors if the syntax is confusing or poorly phrased.',
    title: 'Grammatical Errors'
  },

  'Named Entities': {
    content: `Some questions can be based on a false premise, and hence, are unanswerable.<br><br>

      <i>"Who was the first human being on Mars?"</i>`,
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
    content: `These are questions that require temporal reasoning for deriving the answer, be it:
      <ul>
        <li>Explicit - <i>"in 1998"</i>
        <li>Implicit - <i>"during the WWI"</i>
        <li>Relative - <i>"current"</i>
        <li>Latent - <i>"who is the US president?"</i>
      </ul>
      Temporal questions also include those whose answer is an explicit temporal expression - 
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
