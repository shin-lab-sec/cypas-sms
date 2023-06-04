import express, { Application } from 'express'
import { client } from './libs/redis-client'
import cors from 'cors'
import fs from 'fs'
import { dockerRouter } from './routes/docker'
import { sandboxRouter } from './routes/sandbox'

const app: Application = express()

//起動
app.listen(8001, () => {
  console.log('Server is running on port', 8001)
})

// parser設定
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// cors設定
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    optionsSuccessStatus: 200,
  }),
)

//ルーティング
app.use('/docker', dockerRouter)
app.use('/sandbox', sandboxRouter)

//開発用
app.get('/redis', async (_req, res) => {
  await client.set('key', 'redis-test')
  const value = await client.get('key')
  res.send({
    message: value + ' success',
  })
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
