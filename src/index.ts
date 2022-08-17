import express, { Application } from 'express'
import { dockerCommand } from 'docker-cli-js'
import { client } from './libs/redis-client'
import cors from 'cors'

const PORT = process.env.PORT || 3000
const app: Application = express()

app.listen(PORT, () => {
  console.log('Server is running on port', PORT)
})

// parser設定
app.use(express.json())
app.use(
  express.urlencoded({
    extended: true,
  }),
)
// cors設定
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200,
  }),
)

app.get('/redis', async (_req, res) => {
  await client.set('key', 'value')
  const value = await client.get('key')
  res.send({
    message: value,
  })
})

app.post('/docker', async (req, res) => {
  const command = req.body.command
  let result
  try {
    result = await dockerCommand(command)
    res.status(200).json(result)
  } catch (e) {
    result = { message: (e as Error).message }
    res.status(500).json(result)
  }
})
