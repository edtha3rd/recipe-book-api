require('dotenv').config()
import express, { Request, Response } from 'express'
import session from 'express-session'
import passport from 'passport'
import routes from './routes/routes'

const app = express()
app.use(session({ secret: process.env.SECRET || 'kitkat' }))

const port = process.env.PORT || 3000

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(passport.initialize())
app.use(passport.session())
app.use(routes)

app.get('/', (req: Request, res: Response) => {
  res.send('<a href="/auth/google">Authenticate with Google</a>')
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
