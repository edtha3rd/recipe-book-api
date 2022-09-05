import { UploadApiResponse, v2 as Cloudinary } from "cloudinary";
import { NextFunction, Request, Response, Router } from "express";
import multer from "multer";
import streamifier from "streamifier";

//prisma
import { PrismaClient } from "@prisma/client";
import uuid4 from "uuid4";
const prisma = new PrismaClient();

const upload = multer();
const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  req.user ? next() : res.sendStatus(401);
};

Cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

declare global {
  namespace Express {
    interface User {
      id: string;
    }
  }
}

const router = Router();

async function main() {
  // add prisma client queries here
  // router.get('/user', (req: Request, res: Response) => {
  //   res.send('Hello User')
  // })
  router.get("/recipes", isLoggedIn, async (req: Request, res: Response) => {
    console.log(req.user);
    res.send("Your recipes will be here");
    // const recipes = await prisma.user.findMany()
    // console.log(recipes)
    // res.send(recipes)
  });
  router.get("/recipe/:id", isLoggedIn, async (req: Request, res: Response) => {
    const recipe = prisma.recipe.findUnique({ where: { id: req.body.id } });
    res.send(recipe);
  });
  router.post(
    "/postrecipe",
    upload.single("image"),
    isLoggedIn,
    async (req: Request, res: Response) => {
      let returnObject;
      // console.log(req.file);
      // console.log(req.body);
      let streamUpload = () => {
        return new Promise((resolve, reject) => {
          const stream = Cloudinary.uploader.upload_stream(
            {
              folder: "recipe-book/images",
              upload_preset: "recipe_book",
              public_id: `${req.body.name}-recipe`,
            },
            (error: Error, result: UploadApiResponse) => {
              if (result) resolve(result);
              else {
                console.log("Error: ", error.message);
                reject(error);
              }
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };
      async function upload() {
        returnObject = await streamUpload();
        console.log("Result: ", returnObject);
      }
      upload();
      //cloudinary upload
      //add new recipe to database
      const recipe = await prisma.recipe.create({
        data: {
          name: req.body.name,
          category: req.body.category,
          ingredients: req.body.ingredients,
          directions: req.body.ingredients,
          prepTime: req.body.prepTime,
          image: returnObject.secure_url,
          authorId: req.user.id || "unknown",
        },
      });
      res.send(recipe);
    }
  );
  router.put(
    "/updaterecipe/:id",
    isLoggedIn,
    async (req: Request, res: Response) => {
      const recipe = prisma.recipe.update({
        where: { id: req.body.id },
        data: {
          id: uuid4(),
          name: req.body.name,
          category: req.body.category,
          directions: req.body.directions,
          ingredients: req.body.ingredients,
          image: req.body.image,
        },
      });
      res.send(recipe);
    }
  );
}

main()
  .catch((e) => {
    console.log(e.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export default router;
