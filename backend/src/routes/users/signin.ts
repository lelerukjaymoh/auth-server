import { Request, Response, Router } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { validateRequest } from "../../middlewares/validate-request";
import { User } from "./../../models/user";
import { BadRequestError } from "../../errors/bad-request-error";
import { PasswordManager } from "../../utils/password-manager";
import config from "./../../config";

const router = Router();

/**
 * @openapi
 * /api/v1/users/signin:
 *   post:
 *     tags:
 *        - Auth
 *     description: Enables user to be authenticated and authorized.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     parameters:
 *        - name: email
 *          description: Email Address
 *        - name: password
 *          description: Password
 *     responses:
 *       200:
 *         description: . Successfully logged in to your account.
 */
router.post(
  "/api/v1/users/signin",
  [
    body("email")
      .notEmpty()
      .withMessage("please provide email address  or username"),
    body("password").notEmpty().withMessage("please provide your password"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: email }, { username: email }],
    });

    if (!user) {
      throw new BadRequestError(`Wrong credentials. Please try again`);
    }

    const passwordExists = await PasswordManager.compare(
      user.password,
      password
    );

    if (!passwordExists) {
      throw new BadRequestError(`Wrong credentials. Please try again`);
    }

    // generate token
    const token = jwt.sign(
      {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        photo: user.photo,
        is_admin: user.is_admin,
      },
      config.SECRET_KEY
    );

    // allow cookie session

    req.session = {
      jwt: token,
    };

    res.status(200).json({
      status: "success",
      user,
      token: token,
      cookie: req.session?.jwt,
      message: `Sucessfully signed in to your account`,
    });
  }
);

export { router as SignInRoutes };
