import { createHash } from 'crypto'
import { dockerCommand } from 'docker-cli-js'
import express from 'express'
import { client } from 'libs/redis-client'
import { generateUserAgentEnv } from '../../userAgent/generateUserAgentEnv'

export const scenarioRouter = express.Router()

scenarioRouter.post('/', async (req, res) => {
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
  const curriculum: 'sample-curriculum' = 'sample-curriculum'
  const userAgent: 'kali-vdi' | 'kali-wetty' = 'kali-vdi'
  try {
    await dockerCommand(
      `compose -p ${userId} -f ./curriculum/${curriculum}/docker-compose.yml -f ./userAgent/${userAgent}/docker-compose.yml --env-file ./curriculum/${curriculum}/.env --env-file ./userAgent/${userAgent}/.env up -d`,
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

scenarioRouter.delete('/', async (req, res) => {
  const userId = req.body.userId

  try {
    await dockerCommand(`compose -p ${userId} down`)
    res.status(200).send({ message: 'success' })
  } catch (e) {
    res.status(500).send({ message: (e as Error).message })
  }
})
