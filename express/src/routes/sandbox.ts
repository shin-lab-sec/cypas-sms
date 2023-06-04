import { dockerCommand } from 'docker-cli-js'
import express from 'express'
import { client } from '../libs/redis-client'
import { createHashKey } from '../utils/createHashKey'
import {
  composeUpScenario,
  composeUpUserAgent,
  existsScenario,
  existsUserAgent,
  getNextPorts,
} from '../services/sandbox-services'

export const sandboxRouter = express.Router()

// 起動させた後、keyを生成しレスポンスとして返す
sandboxRouter.post('/', async (req, res) => {
  const sandboxKey = req.body.sandboxKey as string
  const userName = req.body.userName as string
  const scenarioName = req.body.scenarioName as string
  const userAgentName = req.body.userAgentName as string

  const isExistsScenario = await existsScenario(sandboxKey)
  const isExistsUserAgent = await existsUserAgent(sandboxKey, userName)

  if (isExistsScenario && isExistsUserAgent) {
    return res.status(500).send({
      message: '既にサンドボックスが起動し、ユーザーエージェントが存在します。',
    })
  }

  // 起動するコンテナのportを用意
  let nextPorts = await getNextPorts()

  // docker compose up時に必要な引数をまとめて定義
  const options = {
    sandboxKey,
    scenarioName,
    userAgentName,
    nextPorts,
    userName,
  }

  try {
    // シナリオとユーザーエージェントを起動
    if (!isExistsScenario && !isExistsUserAgent) {
      await composeUpScenario(options)
      await composeUpUserAgent(options)
    }

    // ユーザーエージェントのみ起動
    if (isExistsScenario && !isExistsUserAgent) {
      await composeUpUserAgent(options)
    }

    // keyを生成し、redisに登録
    const hashKey = createHashKey(sandboxKey, nextPorts)
    await client.set(hashKey, nextPorts)

    res.status(200).send({ key: hashKey })
  } catch (e) {
    res.status(500).send({ message: (e as Error).message })
  }
})

sandboxRouter.delete('/', async (req, res) => {
  const sandboxKey = req.query.sandboxKey as string

  try {
    // 消せなくてもエラー出ない！！対応必須！
    await dockerCommand(`compose -p ${sandboxKey} down`)

    res.status(200).send({ message: 'success' })
  } catch (e) {
    res.status(500).send({ message: (e as Error).message })
  }
})
