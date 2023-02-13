import { Request, Response, Router } from "express";
import { body } from "express-validator";
import { validateRequest } from "../../middlewares/validate-request";
import { User } from "./../../models/user";
import { BadRequestError } from "../../errors/bad-request-error";
import { PasswordManager } from "../../utils/password-manager";

const router = Router();

/**
 * @openapi
 * /api/v1/users/password-reset:
 *   post:
 *     tags:
 *        - Auth
 *     description: Enables user to reset thier password with received password reset code.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     parameters:
 *        - name: code
 *          description: Password Reset Code
 *        - name: password
 *          description: Password
 *        - name: confirm_password
 *          description: Confirm Password
 *     responses:
 *       200:
 *         description: . Successfully resets user password.
 */
router.post(
  "/api/v1/users/password-reset",
  [
    body("code").notEmpty().withMessage("Please provide the send code"),
    body("password").notEmpty().withMessage("Please provide password"),
    body("confirm_password")
      .notEmpty()
      .withMessage("Please confirm your password"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { code, password, confirm_password } = req.body;

    const user = await User.findOne({ password_reset_token: code });

    if (!user) {
      throw new BadRequestError(
        "User with supplied email does exist. Please try again later."
      );
    }

    // check it the password meets the required format
    if (
      (await PasswordManager.isCorrectFormat(password)) ||
      (await PasswordManager.isCorrectFormat(confirm_password))
    ) {
      throw new BadRequestError(
        "Your password must be have at least; 6 characters long, 1 uppercase & lowercase characters and a number",
        "password"
      );
    }
    // check if password and confirm password match

    if (password !== confirm_password) {
      throw new BadRequestError(
        "Your password and confirm password does not match"
      );
    }
    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      {
        password_reset: { code: "", is_changed: false },
        password,
      },
      { new: true }
    );

    res.status(201).json({
      success: "success",
      user: updatedUser,
      message: `Your password was reset successfully`,
    });
  }
);

export { router as UserResetPasswordResetRoutes };
