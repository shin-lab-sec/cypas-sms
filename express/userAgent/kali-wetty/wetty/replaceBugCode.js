// 1. build/shared/config.js内部でsslが上手く宣言されていない箇所がある
// 2. かなりハックではあるが、bugCodeをmodifiedCodeに書き換える

import fs from 'fs-extra'

const bugCode = `const ssl = {
  key: opts['ssl-key'],
  cert: opts['ssl-cert'],
  ...config.ssl,
};`

const modifiedCode = `const ssl = {
  key: "ssl/key.pem",
  cert: "ssl/cert.pem",
};`

function replaceBugCode(code, replacementString) {
  return code.replace(bugCode, replacementString)
}

fs.readFile('build/shared/config.js', 'utf8', (err, data) => {
  if (err) {
    console.error(err)
    return
  }

  replaceBugCode(data, modifiedCode)
})
