import { Router } from 'express'
import recipesController from '../controllers/recipes.controller'
import usersController from '../controllers/users.controller'

const api = Router().use(usersController).use(recipesController)

export default Router().use('/', api)
