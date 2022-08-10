require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

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

app.post('/api/persons', (request, response) => {
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

    // if (persons.findIndex(person => person.name.toLowerCase() === name.toLowerCase()) !== -1) {
    //   return response.status(400).json({ 
    //     error: 'name must be unique' 
    //   })
    // }

    const person = new Person({
        name: name,
        number: number,
    })

    person.save().then(savedPerson => {
      response.json(savedPerson)
    })
    

})

app.get('/api/persons/:id', (request, response) => {
    const {id} = request.params
    Person.findById(id).then(person => {
      response.json(person)
    })
})

app.delete('/api/persons/:id', (request, response) => {
    const {id} = request.params
    persons = persons.filter(person => person.id !== Number(id))

    response.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})