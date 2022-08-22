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

app.post('/terminal/start', async (req, res) => {
  const key = req.body.key

  let nextPorts
  const usedPorts = await client.get('usedPorts')
  if (usedPorts) {
    nextPorts = Number(usedPorts) + 1
  } else {
    nextPorts = 30000
  }
  await client.set('usedPorts', nextPorts)
  await client.set(key, nextPorts)

  let result
  try {
    result = await dockerCommand(
      `run -p ${nextPorts}:3000 --name ${key}  wetty yarn start --ssh-host 127.0.0.1 --base / --allow-iframe true`,
    )
    res.status(200).json(result)
  } catch (e) {
    result = { message: (e as Error).message }
    res.status(500).json(result)
  }
})

app.post('/terminal/delete', async (req, res) => {
  const key = req.body.key

  await client.del(key)

  let result
  try {
    result = await dockerCommand(`container rm ${key} -f`)
    res.status(200).json(result)
  } catch (e) {
    result = { message: (e as Error).message }
    res.status(500).json(result)
  }
})
