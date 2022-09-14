require("dotenv").config();
// import cookieSession from "cookie-session";
import cors from "cors";
import express, { Request, Response } from "express";
import session from "express-session";
import passport from "passport";
import routes from "./routes/routes";

// Add a list of allowed origins.
// If you have more origins you would like to add, you can add them to the array below.
const allowedOrigins = [process.env.CLIENT_URL];

const options: cors.CorsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "PUT", "POST", "DELETE"],
  credentials: true,
};

const app = express();

const port = process.env.PORT;

app.use(express.urlencoded({ extended: false }));
// app.use(
//   cookieSession({
//     name: "session",
//     keys: [process.env.SECRET],
//     maxAge: 24 * 60 * 60 * 7,
//   })
// );
// app.use(session({ secret: process.env.SECRET || "kitkat" }));
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    // cookie: { secure: true },
  })
);
app.use(cors(options));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(routes);

app.get("/", (req: Request, res: Response) => {
  res.send('<a href="/auth/google">Authenticate with Google</a>');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
