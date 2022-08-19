import { PrismaClient, User } from '@prisma/client'
import { Request, Response, Router } from 'express'
import passport from 'passport'
import { PassportGoogleUserEntity } from '../models/PassportGoogleUserEntity'
const GoogleStrategy = require('passport-google-oauth2').Strategy

const router = Router()
const prisma = new PrismaClient()

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:8008/auth/google/callback/',
      scope: [' profile '],
      state: true,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: PassportGoogleUserEntity,
      cb: any
    ) => {
      //check if user already exists
      const hasUser = await prisma.user.findUnique({
        where: { username: profile._json.email },
      })
      if (hasUser) {
        cb(null, hasUser)
      } else {
        const newUser = await prisma.user.create({
          data: {
            provider: 'google',
            username: profile._json.email,
            displayName: profile.displayName,
            avatarURL: profile.photos[0].value,
          },
        })
        cb(null, newUser)
      }
    }
  )
)

passport.serializeUser(async (newUser, done) => {
  done(null, (newUser as User).username)
})

passport.deserializeUser(async (newUser: string, done) => {
  const thisUser = await prisma.user.findUnique({
    where: { username: newUser },
  })
  if (!thisUser) return done('No user to deserialize')

  return done(null, thisUser)
})

async function main() {
  router.get(
    '/auth/google',
    passport.authenticate('google', { scope: ['email', 'profile'] })
  )
  router.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req: Request, res: Response) => {
      res.redirect('/recipes')
    }
  )
  //   router.post(
  //     `/signup/authenticateUser`,
  //     async (req: Request, res: Response) => {
  //       const newUser = await prisma.user.create({
  //         data: {
  //           username: profile.displayName,
  //         },
  //       })
  //       console.log('User:', newUser)
  //       res.send(newUser)
  //     }
  //   )
}

main()
  .catch((e) => {
    console.log(e.message)
  })
  .finally(async () => {})

export default router
