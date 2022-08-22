import { NextFunction, Request, Response, Router } from 'express'

//prisma
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  req.user ? next() : res.sendStatus(401)
}

const router = Router()

async function main() {
  // add prisma client queries here
  // router.get('/user', (req: Request, res: Response) => {
  //   res.send('Hello User')
  // })
  router.get('/recipes', isLoggedIn, async (req: Request, res: Response) => {
    console.log(req.user)
    res.send('Your recipes will be here')
    // const recipes = await prisma.user.findMany()
    // console.log(recipes)
    // res.send(recipes)
  })
  router.get('recipes/:id', isLoggedIn, async (req: Request, res: Response) => {
    const recipe = prisma.recipe.findUnique({ where: { id: req.body.id } })
    res.send(recipe)
  })
  router.post(
    './postRecipe',
    isLoggedIn,
    async (req: Request, res: Response) => {
      const recipe = await prisma.recipe.create({
        data: {
          ingredients: req.body.ingredients,
          directions: req.body.ingredients,
          image: req.body.image,
          author: req.user || 'unknown',
        },
      })
      res.send(recipe)
    }
  )
  router.put(
    '/updateRecipe/:id',
    isLoggedIn,
    async (req: Request, res: Response) => {
      const recipe = prisma.recipe.update({
        where: { id: req.body.id },
        data: {
          ingredients: req.body.ingredients,
          directions: req.body.ingredients,
          image: req.body.image,
        },
      })
      res.send(recipe)
    }
  )
}

main()
  .catch((e) => {
    console.log(e.message)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

export default router
