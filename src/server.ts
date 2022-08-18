import express, { Request, Response } from 'express'
import routes from './routes/routes'

const app = express()

const port = process.env.PORT || 3000
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(routes)

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World')
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
