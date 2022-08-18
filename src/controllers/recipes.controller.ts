import { Request, Response, Router } from 'express'

//prisma
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const router = Router()

async function main() {
  // add prisma client queries here
  // router.get('/user', (req: Request, res: Response) => {
  //   res.send('Hello User')
  // })
  router.get('/recipes', async (req: Request, res: Response) => {
    const recipes = await prisma.user.findMany()
    console.log(recipes)
    res.send(recipes)
  })
  router.post('./postRecipe', async (req: Request, res: Response) => {})
}

main()
  .catch((e) => {
    console.log(e.message)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

export default router
