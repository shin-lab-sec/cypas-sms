import fs from 'fs-extra'

// ymlファイル内のUNIQUEを任意の文字列に置き換えるだけの関数
export const replaceUNIQUEInYml = async ({
  inputFilePath,
  outputFilePath,
  UNIQUEto,
}: {
  inputFilePath: string
  outputFilePath: string
  UNIQUEto: string
}) => {
  try {
    const inputYml = await fs.readFile(inputFilePath, 'utf8')
    const outputYml = inputYml.replace(/UNIQUE/g, UNIQUEto)

    await fs.ensureFile(outputFilePath)
    await fs.writeFile(outputFilePath, outputYml, 'utf8')
  } catch (error) {
    throw error
  }
}
