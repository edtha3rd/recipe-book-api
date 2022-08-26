import { v2 as Cloudinary } from 'cloudinary'
import { NextFunction, Request, Response, Router } from 'express'
import multer from 'multer'

//prisma
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const upload = multer()
const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  req.user ? next() : res.sendStatus(401)
}

Cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
})

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
  router.get('recipe/:id', isLoggedIn, async (req: Request, res: Response) => {
    const recipe = prisma.recipe.findUnique({ where: { id: req.body.id } })
    res.send(recipe)
  })
  router.post(
    './postrecipe',
    upload.single('image'),
    isLoggedIn,
    async (req: Request, res: Response) => {
      console.log(req.file)
      //options
      // const options: Object = {
      //   preset:
      // }
      //cloudinary upload
      // Cloudinary.uploader.upload(req.file, options)
      //add new recipe to database
      const recipe = await prisma.recipe.create({
        data: {
          name: req.body.name,
          category: req.body.category,
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
    '/updaterecipe/:id',
    isLoggedIn,
    async (req: Request, res: Response) => {
      const recipe = prisma.recipe.update({
        where: { id: req.body.id },
        data: {
          name: req.body.name,
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
