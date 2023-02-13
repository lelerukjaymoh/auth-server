import { Request, Response, NextFunction } from "express";
import { CustomError } from "../errors/custom-error";
import multer from "multer";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).send({
      errors: [{ message: "File too large: Maximum size is 20MB" }],
    });
  }

  console.log(err);

  res.status(400).send({
    errors: [{ message: "Oooops!! Something went wrong..." }],
  });

  return;
};
