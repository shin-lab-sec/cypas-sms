import { createHash } from 'crypto'
import { dockerCommand } from 'docker-cli-js'
import express from 'express'
import { client } from '../libs/redis-client'
import { createHashKey } from '../utils/createHashKey'
import {
  existsScenario,
  existsUserAgent,
  getNextPorts,
} from '../services/scenario-services'
import { generateUserAgentEnv } from '../../userAgent/generateUserAgentEnv'

export const scenarioRouter = express.Router()

const curriculum: 'sample-curriculum' = 'sample-curriculum'
const userAgent: 'kali-vdi' | 'kali-wetty' = 'kali-vdi'

// 起動させた後、keyを生成しレスポンスとして返す
scenarioRouter.post('/', async (req, res) => {
  const scenarioKey = req.body.scenarioKey as string
  const userName = req.body.userName as string

  const isExistsScenario = await existsScenario(scenarioKey)
  const isExistsUserAgent = await existsUserAgent(scenarioKey, userName)

  if (isExistsScenario && isExistsUserAgent) {
    return res.status(500).send({
      message: '既にシナリオが起動し、ユーザーエージェントが存在します。',
    })
  }

  // 起動するコンテナのportを用意
  let nextPorts = await getNextPorts()

  try {
    // ユーザーエージェントのみ起動
    // NOTE: 現在のコマンドだと2個目以降のユーザーエージェントが上書きされてしまう
    if (isExistsScenario && !isExistsUserAgent) {
      await dockerCommand(
        `compose -p ${scenarioKey} -f ./userAgent/${userAgent}/docker-compose.yml --env-file ./userAgent/${userAgent}/.env up -d`,
        { env: generateUserAgentEnv(nextPorts, userName, userName) },
      )
    }

    // シナリオ、ユーザーエージェントを起動
    if (!isExistsScenario && !isExistsUserAgent) {
      await dockerCommand(
        `compose -p ${scenarioKey} -f ./curriculum/${curriculum}/docker-compose.yml -f ./userAgent/${userAgent}/docker-compose.yml --env-file ./curriculum/${curriculum}/.env --env-file ./userAgent/${userAgent}/.env up -d`,
        { env: generateUserAgentEnv(nextPorts, userName, userName) },
      )
    }

    const hashKey = createHashKey(scenarioKey, nextPorts)
    await client.set(hashKey, nextPorts)

    res.status(200).send({ key: hashKey })
  } catch (e) {
    res.status(500).send({ message: (e as Error).message })
  }
})

scenarioRouter.delete('/', async (req, res) => {
  const scenarioKey = req.body.scenarioKey as string

  try {
    await dockerCommand(`compose -p ${scenarioKey} down`)

    res.status(200).send({ message: 'success' })
  } catch (e) {
    res.status(500).send({ message: (e as Error).message })
  }
})
