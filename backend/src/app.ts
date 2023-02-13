import express, { json } from "express";
import cors from "cors";
import path from "path";
import "express-async-errors";
import cookieSession from "cookie-session";
import { NotFoundError } from "./errors";
import { errorHandler } from "./middlewares";

const app = express();

app.set("trust proxy", false);
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(json());
app.use(json());
app.use(cors());

app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/emails"));

app.use(express.json({ limit: "350mb" }));
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
    maxAge: 24 * 60 * 60 * 1000,
  })
);

// ROUTES
import "./routes/index";

// Not found Route
app.all("*", async (_req, _res) => {
  throw new NotFoundError();
});

// ERROR HANDLING
app.use(errorHandler);

export { app };
