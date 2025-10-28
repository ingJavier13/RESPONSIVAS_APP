//archivo principal del servidor Express
const express = require('express')
const cors = require('cors')
const responsivasRouter = require('./routes/responsivas')
const passwordsRouter = require('./routes/passwords');
const authRouter = require('./routes/auth')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/responsivas', responsivasRouter)
app.use('/uploads', express.static('uploads'));
app.use('/api/passwords', passwordsRouter)
app.use('/api/auth', authRouter);

app.listen(3001, '0.0.0.0', () => {
  console.log('Servidor corriendo en http://192.168.1.12:3001')
})