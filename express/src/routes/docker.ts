import { dockerCommand } from 'docker-cli-js'
import express from 'express'

export const dockerRouter = express.Router()

dockerRouter.post('/', async (req, res) => {
  const command = req.body.command
  let result
  try {
    result = await dockerCommand(command)
    res.status(200).send(result)
  } catch (e) {
    result = { message: (e as Error).message }
    res.status(500).send(result)
  }
})
