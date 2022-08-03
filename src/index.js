const express = require('express')

const app = express()

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

let persons = [
    { 
        "id": 1,
        "name": "Arto Hellas", 
        "number": "040-123456"
      },
      { 
        "id": 2,
        "name": "Ada Lovelace", 
        "number": "39-44-5323523"
      },
      { 
        "id": 3,
        "name": "Dan Abramov", 
        "number": "12-43-234345"
      },
      { 
        "id": 4,
        "name": "Mary Poppendieck", 
        "number": "39-23-6423122"
      }
]

app.get('/', (request, response) => {
    response.send('Hello World!')
})

app.get('/info', (request, response) => {
    let info = `<p>Phonebook has info for ${Object.keys(persons).length} people</p>`
    const requestedAt = new Date();
    response.send(`${info} <p> ${requestedAt} </p>`)
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
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

    if (persons.findIndex(person => person.name.toLowerCase() === name.toLowerCase()) !== -1) {
      return response.status(400).json({ 
        error: 'name must be unique' 
      })
    }

    const generateId = () => {
        const maxId = persons.length > 0
          ? Math.max(...persons.map(person => person.id))
          : 0
        return maxId + 1
    }

    const person = {
        id: generateId(),
        name: name,
        number: number,
    }

    persons.push(person)
    response.json(person)

})

app.get('/api/persons/:id', (request, response) => {
    const {id} = request.params
    const person = persons.filter(person => person.id !== Number(id))
    return response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
    const {id} = request.params
    persons = persons.filter(person => person.id !== Number(id))

    response.status(204).end()
})

let port = 3001

app.listen(port, function () {
    console.log('App listening on port ' + port + '!');
  });