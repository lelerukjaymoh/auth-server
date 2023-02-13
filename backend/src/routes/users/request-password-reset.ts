import { Request, Response, Router } from "express";
import { body } from "express-validator";
import { validateRequest } from "../../middlewares/validate-request";
import { User } from "./../../models/user";
import { BadRequestError } from "../../errors/bad-request-error";
import { randomCode } from "../../utils/common";

const router = Router();

/**
 * @openapi
 * /api/v1/users/request-password-reset:
 *   post:
 *     tags:
 *        - Auth
 *     description: Enable user to request password reset.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     parameters:
 *        - name: email
 *          description: Email Address  or username
 *     responses:
 *       200:
 *         description: . Successfully initiates the process of reseting password.
 */
router.post(
  "/api/v1/users/request-password-reset",
  [
    body("email")
      .notEmpty()
      .withMessage("Please provide your email or username to proceed"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
      throw new BadRequestError(
        "User with supplied email does exist. Please try again later."
      );
    }

    // generate reset token
    const code = randomCode();

    // update user information

    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      {
        password_reset: { is_changed: true },
        password_reset_token: code,
      },
      { new: true }
    );

    res.status(201).json({
      success: "success",
      user: updatedUser,
      message: `Successfully requested for password reset`,
    });
  }
);

export { router as UserRequestPasswordResetRoutes };
