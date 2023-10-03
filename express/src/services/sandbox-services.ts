import { generateUserAgentEnv } from '../../userAgent/generateUserAgentEnv'
import { client } from '../libs/redis-client'
import { dockerCommand } from 'docker-cli-js'
import { replaceUNIQUEInYml } from '../utils/replaceUNIQUEInYml'

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

//シナリオが存在するかどうか
export const existsScenario = async (sandboxKey: string) => {
  const result = (await dockerCommand(
    `compose -p ${sandboxKey} ps`,
  )) as DockerPsResponse
  return result.containerList.length > 0
}

// ユーザーエージェントが存在するかどうか
export const existsUserAgent = async (sandboxKey: string, userName: string) => {
  const result = (await dockerCommand(
    `compose -p ${sandboxKey} ps`,
  )) as DockerPsResponse
  return result.containerList.some(v => v.name.endsWith(userName))
}

// シナリオ起動
export const composeUpScenario = async ({
  sandboxKey,
  scenarioName,
}: {
  sandboxKey: string
  scenarioName: string
}) => {
  await dockerCommand(
    `compose -p ${sandboxKey} -f ./scenario/${scenarioName}/docker-compose.yml --env-file ./scenario/${scenarioName}/.env up -d`,
  )
}

// ユーザーエージェント起動
export const composeUpUserAgent = async ({
  sandboxKey,
  userAgentName,
  nextPorts,
  userName,
}: {
  sandboxKey: string
  userAgentName: string
  nextPorts: number
  userName: string
}) => {
  // 1. 複数人でシナリオを起動したい
  // 2. 環境変数だけ変えてdocker compose up！
  // 3. ユーザーエージェントが上書きされてしまう問題発生
  // 4. docker-compose.yml内のservicesの各service名が同じだと上書きされるみたい
  // 5. docker compose時の環境変数で各service名を動的に埋め込めない（docker composeの仕様的に）
  // 6. よし、docker-compose.yml自体を動的に書き換えちゃえ
  // 7. 各service名を「hoge-UNIQUE」みたいにしてUNIQUEをuserNameに書き換えて解決！
  replaceUNIQUEInYml({
    inputFilePath: `./userAgent/${userAgentName}/docker-compose.yml`,
    outputFilePath: './tmp/docker-compose.yml',
    UNIQUEto: userName,
  })

  await dockerCommand(
    `compose -p ${sandboxKey} -f ./tmp/docker-compose.yml --env-file ./userAgent/${userAgentName}/.env up -d`,
    { env: generateUserAgentEnv(nextPorts, userName, userName) },
  )
}
