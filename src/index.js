require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const { unknownEndpoint, errorHandler } = require('./middleware')

const app = express()
const url = process.env.MONGODB_URI

app.use(cors())
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(express.static('build'))

morgan.token('payload', function(req, res){
  return (req.method === 'POST' ? JSON.stringify(req.body) : '')
})

app.use(morgan(':method :url :res[content-length] - :response-time ms :payload'))

app.get('/', (request, response) => {
    response.send('Hello World!')
})

app.get('/info', (request, response) => {
    let info = `<p>Phonebook has info for ${Object.keys(persons).length} people</p>`
    const requestedAt = new Date();
    response.send(`${info} <p> ${requestedAt} </p>`)
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(person => {
    response.json(person)
  })
})

app.post('/api/persons', (request, response, next) => {
  const {name, number} = request.body

  if (!name) {
    return response.status(400).json({ 
      error: 'name missing' 
    })
  }

  if (!number) {
    return response.status(400).json({ 
      error: 'number missing' 
    })
  }

  const person = new Person({
      name: name,
      number: number,
  })

  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  const {id} = request.params
  Person.findById(id).then(person => {
    if (!person) {
      response.status(404).end()
    }
    response.json(person)
  }).catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const {id} = request.params
  const {name, number} = request.body
  const person = {
    name: name,
    number: number,
  }
  const opts = {
    new: true, 
    runValidators: true, 
    context: 'query'
  }
  
  Person.findByIdAndUpdate(id, person, opts)
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response) => {
  const {id} = request.params
  Person.findByIdAndRemove(id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

//const unknownEndpoint = (request, response) => {
//  response.status(404).send({ error: 'unknown endpoint' })
//}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

//const errorHandler = (error, request, response, next) => {
//  console.error(error.message)

//  if (error.name === 'CastError') {
//    return response.status(400).send({ error: 'malformatted id' })
//  } 

//  next(error)
//}

// handler of requests with result to errors
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})