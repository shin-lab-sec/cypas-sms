import { dockerCommand } from 'docker-cli-js'
import express from 'express'
import { client } from '../libs/redis-client'
import { createHashKey } from '../utils/createHashKey'
import {
  composeUpCurriculum,
  composeUpUserAgent,
  existsScenario,
  existsUserAgent,
  getNextPorts,
} from '../services/scenario-services'

export const scenarioRouter = express.Router()

// 起動させた後、keyを生成しレスポンスとして返す
scenarioRouter.post('/', async (req, res) => {
  const scenarioKey = req.body.scenarioKey as string
  const userName = req.body.userName as string
  const curriculumName = req.body.curriculumName as string
  const userAgentName = req.body.userAgentName as string

  const isExistsScenario = await existsScenario(scenarioKey)
  const isExistsUserAgent = await existsUserAgent(scenarioKey, userName)

  if (isExistsScenario && isExistsUserAgent) {
    return res.status(500).send({
      message: '既にシナリオが起動し、ユーザーエージェントが存在します。',
    })
  }

  // 起動するコンテナのportを用意
  let nextPorts = await getNextPorts()

  // docker compose up時に必要な引数をまとめて定義
  const options = {
    scenarioKey,
    curriculumName,
    userAgentName,
    nextPorts,
    userName,
  }

  try {
    // カリキュラムとユーザーエージェントを起動
    if (!isExistsScenario && !isExistsUserAgent) {
      await composeUpCurriculum(options)
      await composeUpUserAgent(options)
    }

    // ユーザーエージェントのみ起動
    if (isExistsScenario && !isExistsUserAgent) {
      await composeUpUserAgent(options)
    }

    // keyを生成し、redisに登録
    const hashKey = createHashKey(scenarioKey, nextPorts)
    await client.set(hashKey, nextPorts)

    res.status(200).send({ key: hashKey })
  } catch (e) {
    res.status(500).send({ message: (e as Error).message })
  }
})

scenarioRouter.delete('/', async (req, res) => {
  const scenarioKey = req.query.scenarioKey as string

  try {
    // 消せなくてもエラー出ない！！対応必須！
    await dockerCommand(`compose -p ${scenarioKey} down`)

    res.status(200).send({ message: 'success' })
  } catch (e) {
    res.status(500).send({ message: (e as Error).message })
  }
})
