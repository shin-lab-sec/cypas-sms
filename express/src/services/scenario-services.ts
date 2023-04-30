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
export const existsScenario = async (scenarioKey: string) => {
  const result = (await dockerCommand(
    `compose -p ${scenarioKey} ps`,
  )) as DockerPsResponse
  return result.containerList.length > 0
}

// ユーザーエージェントが存在するかどうか
export const existsUserAgent = async (
  scenarioKey: string,
  userName: string,
) => {
  const result = (await dockerCommand(
    `compose -p ${scenarioKey} ps`,
  )) as DockerPsResponse
  return result.containerList.some(v => v.name.endsWith(userName))
}

// カリキュラム起動
export const composeUpCurriculum = async ({
  scenarioKey,
  curriculum,
}: {
  scenarioKey: string
  curriculum: string
}) => {
  await dockerCommand(
    `compose -p ${scenarioKey} -f ./curriculum/${curriculum}/docker-compose.yml --env-file ./curriculum/${curriculum}/.env up -d`,
  )
}

// ユーザーエージェント起動
export const composeUpUserAgent = async ({
  scenarioKey,
  userAgent,
  nextPorts,
  userName,
}: {
  scenarioKey: string
  userAgent: string
  nextPorts: number
  userName: string
}) => {
  // 1. 複数人でシナリオを起動したい
  // 2. 環境変数だけ変えてdocker compose up！
  // 2. ユーザーエージェントが上書きされてしまう問題発生
  // 3. docker-compose.yml内のservicesの各service名が同じだと上書きされるみたい
  // 4. docker compose時の環境変数で各service名を動的に埋め込めない（docker composeの仕様的に）
  // 5. よし、docker-compose.yml自体を動的に書き換えちゃえ
  // 6. 各service名を「hoge-UNIQUE」みたいにしてUNIQUEをuserNameに書き換えて解決！
  replaceUNIQUEInYml({
    inputFilePath: `./userAgent/${userAgent}/docker-compose.yml`,
    outputFilePath: './tmp/docker-compose.yml',
    UNIQUEto: userName,
  })

  await dockerCommand(
    `compose -p ${scenarioKey} -f ./tmp/docker-compose.yml --env-file ./userAgent/${userAgent}/.env up -d`,
    { env: generateUserAgentEnv(nextPorts, userName, userName) },
  )
}
