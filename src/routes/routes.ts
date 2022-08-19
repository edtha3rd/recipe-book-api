import { Router } from 'express'
import authController from '../controllers/auth.controller'
import recipesController from '../controllers/recipes.controller'
import usersController from '../controllers/users.controller'

const api = Router()
  .use(usersController)
  .use(recipesController)
  .use(authController)

export default Router().use('/', api)
