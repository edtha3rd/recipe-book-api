import { PrismaClient, User } from "@prisma/client";
import { Request, Response, Router } from "express";
import passport from "passport";
import { PassportGoogleUserEntity } from "../models/PassportGoogleUserEntity";
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const saltRounds = 10;

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
      console.log("google strategy");
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
passport.use(
  new LocalStrategy(async (username: string, password: string, cb) => {
    console.log("local strategy");
    // hash user password
    const hash = bcrypt.hashSync(password, saltRounds);
    //check if user already exists
    const hasUser = await prisma.user
      .findUnique({
        where: { username: username },
      })
      .catch((error) => {
        console.error(error);
      });
    if (!hasUser || bcrypt.compare(hash, hasUser.password)) {
      return cb(null, false, { message: "Incorrect username or password" });
    } else if (hasUser && bcrypt.compare(hash, hasUser.password)) {
      cb(null, hasUser);
    }
  })
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
  router.get("/auth/login/success", (req, res) => {
    if (req.user) {
      res.status(200).json({
        success: true,
        message: "successful",
        user: req.user,
      });
      // .redirect(`${process.env.CLIENT_URL}/#/`);
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
  router.post("/logout", (req, res, next) => {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect(process.env.CLIENT_URL);
    });
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
  router.post(
    "/login/local",
    passport.authenticate("local", {
      failureRedirect: `/auth/login/failed`,
    }),
    (req: Request, res: Response) => {
      res.cookie = req.cookies;
      res.redirect(`${process.env.CLIENT_URL}`);
    }
  );
  router.post("/signup", async (req, res, cb) => {
    let hashed;
    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
      hashed = hash;
    });
    const newUser = await prisma.user
      .create({
        data: {
          provider: "local",
          password: hashed,
          username: req.body.username,
          displayName: req.body.displayName,
          avatarURL: "defaultAvatarURL",
        },
      })
      .catch((err) => {
        return cb(err);
      });
    if (newUser) {
      req.login(newUser, (err) => {
        if (err) return cb(err);
        res.redirect("/");
      });
    }
  });
}

main()
  .catch((e) => {
    console.log(e.message);
  })
  .finally(async () => {});

export default router;
