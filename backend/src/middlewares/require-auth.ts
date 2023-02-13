import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { NotAuthorizedError } from "./../errors/not-authorized-error";
import { UserPayload } from "./../types/user";
import config from "./../config";

export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  let token: any;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  const accessToken = req.session?.jwt || token;

  if (!accessToken) {
    throw new NotAuthorizedError();
  }

  try {
    const payload = jwt.verify(accessToken, config.SECRET_KEY) as UserPayload;

    req.currentUser = payload;

    if (!req.currentUser) {
      throw new NotAuthorizedError();
    }
    next();
  } catch (err) {
    throw new NotAuthorizedError();
  }
};
