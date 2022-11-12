import express, { Application } from 'express'
import { dockerCommand } from 'docker-cli-js'
import { client } from './libs/redis-client'
import cors from 'cors'
import { createHash } from 'crypto'
import fs from 'fs'
import { generateUserAgentEnv } from '../userAgent/generateUserAgentEnv'

const PORT = 5000
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
    origin: process.env.CLIENT_URL,
    credentials: true,
    optionsSuccessStatus: 200,
  }),
)

app.get('/redis', async (_req, res) => {
  await client.set('key', 'redis-test')
  const value = await client.get('key')
  res.send({
    message: value + ' success',
  })
})

app.post('/docker', async (req, res) => {
  const command = req.body.command
  let result
  try {
    result = await dockerCommand(command)
    res.status(200).send(result)
  } catch (e) {
    result = { message: (e as Error).message }
    res.status(500).send(result)
  }
})

app.post('/terminal/start', async (req, res) => {
  const userId = req.body.userId as string
  const userName = req.body.userName as string

  // 起動するコンテナのportを用意
  let nextPorts
  const usedPorts = await client.get('usedPorts')
  if (usedPorts) {
    nextPorts = Number(usedPorts) + 1
  } else {
    nextPorts = 30000
  }
  await client.set('usedPorts', nextPorts)

  // 起動させた後、keyを生成しレスポンスとして返す
  try {
    await dockerCommand(
      // TODO: nextPorts使う
      `compose -p ${userId} -f ./curriculum/sample-curriculum/docker-compose.yml -f ./userAgent/kali-wetty/docker-compose.yml --env-file ./curriculum/sample-curriculum/.env --env-file ./userAgent/kali-wetty/.env up -d`,
      { env: generateUserAgentEnv(nextPorts, userName, userName) },
    )
    const hashKey = createHash('sha256')
      .update(`${userId}${nextPorts}`)
      .digest('hex')
    await client.set(hashKey, nextPorts)
    res.status(200).send({ key: hashKey })
  } catch (e) {
    res.status(500).send({ message: (e as Error).message })
  }
})

app.post('/terminal/delete', async (req, res) => {
  const userId = req.body.userId

  try {
    await dockerCommand(`compose -p ${userId} down`)
    res.status(200).send({ message: 'success' })
  } catch (e) {
    res.status(500).send({ message: (e as Error).message })
  }
})

app.get('/env', async (_req, res) => {
  const s = 'PORT=6000'
  try {
    fs.writeFileSync('.env.test', s, 'utf-8')
  } catch (err) {
    console.log(err)
  }
  res.send({
    message: process.env,
  })
})
