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
  router.post('/createUser', async (req: Request, res: Response) => {
    const user = await prisma.user.create({
      data: {
        username: 'Kyle',
      },
    })
    console.log('User:', user)
    res.send(user)
  })
  router.get('/users', async (req: Request, res: Response) => {
    const users = await prisma.user.findMany()
    console.log(users)
    res.send(users)
  })
}

main()
  .catch((e) => {
    console.log(e.message)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

export default router
