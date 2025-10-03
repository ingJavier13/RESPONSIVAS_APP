//archivo principal del servidor Express
const express = require('express')
const cors = require('cors')
const responsivasRouter = require('./routes/responsivas')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/responsivas', responsivasRouter)
app.use('/uploads', express.static('uploads'));

app.listen(3001, () => {
  console.log('Servidor corriendo en http://localhost:3001')
})