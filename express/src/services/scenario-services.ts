import { createHash } from 'crypto'
import { client } from '../libs/redis-client'
import { dockerCommand } from 'docker-cli-js'

// TODO: Number(usedPorts) + 1が既に使用済みポートだった時の処理を追加する
// 次に使用するポートを返す。
export const getNextPorts = async () => {
  let nextPorts: number
  const usedPorts = await client.get('usedPorts')
  if (usedPorts) {
    nextPorts = Number(usedPorts) + 1
  } else {
    nextPorts = 30000
  }
  await client.set('usedPorts', nextPorts)

  return nextPorts
}

type DockerPsResponse = {
  containerList: {
    name: string
    command: string
    service: string
    status: string
    ports: string
  }[]
}

export const existsScenario = async (scenarioKey: string) => {
  const result = (await dockerCommand(
    `compose -p ${scenarioKey} ps`,
  )) as DockerPsResponse
  return result.containerList.length > 0
}

export const existsUserAgent = async (
  scenarioKey: string,
  userName: string,
) => {
  const result = (await dockerCommand(
    `compose -p ${scenarioKey} ps`,
  )) as DockerPsResponse
  return result.containerList.some(v => v.name.endsWith(userName))
}
