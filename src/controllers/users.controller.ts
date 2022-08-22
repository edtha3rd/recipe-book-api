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

  router.get('/users', async (req: Request, res: Response) => {
    const users = await prisma.user.findMany()
    console.log(users)
    res.send(users)
  })
  router.get('user/:username', async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { username: req.body.username },
    })
    res.send(user)
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
