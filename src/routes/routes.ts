import { Router } from 'express'
import usersController from '../controllers/users.controller'

const api = Router().use(usersController)

export default Router().use('/', api)
