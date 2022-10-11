import { PrismaClient, User } from "@prisma/client";
import { Request, Response, Router } from "express";
import passport from "passport";
import { PassportGoogleUserEntity } from "../models/PassportGoogleUserEntity";
const GoogleStrategy = require("passport-google-oauth2").Strategy;

const router = Router();
const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.API}/auth/google/callback/`,
      scope: [" profile "],
      state: true,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: PassportGoogleUserEntity,
      cb: any
    ) => {
      //check if user already exists
      const hasUser = await prisma.user
        .findUnique({
          where: { username: profile._json.email },
        })
        .catch((error) => {
          console.error(error);
        });
      if (hasUser) {
        cb(null, hasUser);
      } else {
        const newUser = await prisma.user.create({
          data: {
            provider: "google",
            username: profile._json.email,
            displayName: profile.displayName,
            avatarURL: profile.photos[0].value,
          },
        });
        cb(null, newUser);
      }
    }
  )
);

passport.serializeUser(async (newUser, done) => {
  done(null, (newUser as User).username);
});

passport.deserializeUser(async (newUser: string, done) => {
  const thisUser = await prisma.user
    .findUnique({
      where: { username: newUser },
    })
    .catch((error) => {
      console.error(error);
    });
  if (!thisUser) return done("No user to deserialize");

  return done(null, thisUser);
});

async function main() {
  router.get("/logout", (req, res) => {
    // req.logout()
    // res.redirect(process.env.API_URI)
  });
  router.get("/auth/login/success", (req, res) => {
    console.log(req.user);
    if (req.user) {
      res
        .status(200)
        .json({
          success: true,
          message: "successful",
          user: req.user,
        })
        .redirect(`${process.env.CLIENT_URL}/#/`);
    } else res.status(404).send();
  });
  router.get("/auth/login/failed", (req, res) => {
    console.log("failed");
    console.log(req.user);
    if (req.user) {
      res
        .status(401)
        .json({
          success: false,
          message: "failed",
        })
        .redirect(`${process.env.CLIENT_URL}/#/login`);
    }
  });
  router.get("/auth/logout", (req, res) => {
    //   req.logout();
    // res.redirect(CLIENT_URL);
  });
  router.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["email", "profile"] })
  );
  router.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: `/auth/login/failed`,
    }),
    (req: Request, res: Response) => {
      res.cookie = req.cookies;
      res.redirect(`${process.env.CLIENT_URL}`);
    }
  );
}

main()
  .catch((e) => {
    console.log(e.message);
  })
  .finally(async () => {});

export default router;
