import express, { Application } from 'express'
import cors from 'cors'

const PORT = 5000
const app: Application = express()

app.listen(PORT, () => {
  console.log('Server is running on port', PORT)
})

// parser設定
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// cors設定
app.use(
  cors({
    origin: '*',
    credentials: true,
    optionsSuccessStatus: 200,
  }),
)

app.get('/test', async (_req, res) => {
  res.send({ message: 'connection succeeded!' })
})
