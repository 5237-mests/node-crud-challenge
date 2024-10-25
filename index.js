const express = require('express')
const cors = require('cors')
const { v4: uuidv4 } = require('uuid')

const app = express()
app.use(express.json())
app.use(cors())

// In-memory database
const persons = [{ id: '1', name: 'Sam', age: 26, hobbies: [] }]
app.set('db', persons)

// Helper function for validating person data
const validatePerson = (person, res) => {
    const { name, age, hobbies } = person
    if (!name) return res.status(400).send('Name is required')
    if (typeof age !== 'number') return res.status(400).send('Age must be a number')
    if (!Array.isArray(hobbies) || !hobbies.every(hobby => typeof hobby === 'string')) {
        return res.status(400).send('Hobbies must be an array of strings')
    }
    return null
}

// Get all persons or person by ID
app.get('/person/:personId?', (req, res) => {
    const { personId } = req.params
    const db = app.get('db')
    if (personId) {
        const person = db.find(p => p.id === personId)
        return person ? res.json(person) : res.status(404).send('Person not found')
    }
    res.json(db)
})

// Add a new person
app.post('/person', (req, res) => {
    const validationError = validatePerson(req.body, res)
    if (validationError) return validationError

    const { name, age, hobbies } = req.body
    const newPerson = { id: uuidv4(), name, age, hobbies }
    app.get('db').push(newPerson)
    res.status(200).json(newPerson)
})

// Update an existing person
app.put('/person/:personId', (req, res) => {
    const { personId } = req.params
    const db = app.get('db')
    const personIndex = db.findIndex(p => p.id === personId)
    if (personIndex === -1) return res.status(404).send('Person not found')

    const updatedData = req.body
    const validationError = validatePerson({ ...db[personIndex], ...updatedData }, res)
    if (validationError) return validationError

    db[personIndex] = { ...db[personIndex], ...updatedData }
    res.json(db[personIndex])
})

// Delete a person
app.delete('/person/:personId', (req, res) => {
    const { personId } = req.params
    const db = app.get('db')
    const personIndex = db.findIndex(p => p.id === personId)
    if (personIndex === -1) return res.status(404).send('Person not found')

    db.splice(personIndex, 1)
    res.status(204).send()
})

// Handle non-existing endpoints
app.use('*', (_, res) => res.status(404).send('Not found'))

if (require.main === module) {
    app.listen(3000)
}

module.exports = app;
