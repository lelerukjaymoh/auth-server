import { Request, Response, Router } from "express";
import { requireAuth } from "./../../middlewares";
import { User } from "./../../models/user";
import { NotAuthorizedError } from "../../errors/not-authorized-error";
import { body } from "express-validator";
import { validateRequest } from "../../middlewares/validate-request";
import { PasswordManager } from "../../utils/password-manager";
import { BadRequestError } from "../../errors/bad-request-error";

const router = Router();
/**
 * @openapi
 * /api/v1/users/currentuser-update-password:
 *   post:
 *     tags:
 *        - Auth
 *     description: Enables currently logged in user to reset his/password.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     parameters:
 *        - name: current_password
 *          description: Current User Password
 *        - name: new_password
 *          description: New Password
 *        - name: confirm_password
 *          description: Confirm your New Password
 *     responses:
 *       200:
 *         description: . Successfully reset password for currently logged in user.
 */
router.post(
  "/api/v1/users/currentuser-update-password",
  [
    body("current_password")
      .notEmpty()
      .withMessage("Please supply your current passwpord"),
    body("new_password")
      .notEmpty()
      .withMessage("Please provide your new password"),
    body("confirm_password")
      .notEmpty()
      .withMessage("Please confirm your new password"),
  ],
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {
    const { new_password, current_password, confirm_password } = req.body;
    const user = await User.findById(req.currentUser?.id!);

    if (!user) {
      throw new NotAuthorizedError();
    }

    const isPasswordCorrect = await PasswordManager.compare(
      user.password,
      current_password
    );

    if (!isPasswordCorrect) {
      throw new BadRequestError("Incorrect password !!!!");
    }

    if (new_password !== confirm_password) {
      throw new BadRequestError(
        "Incorrect. Please make sure you new password and confirm password matches"
      );
    }
    // update password

    await User.findByIdAndUpdate(
      user.id,
      { password: new_password },
      { new: true }
    );
    res.status(200).send({
      status: "success",
      message: "Successfully updated your password",
    });
  }
);

export { router as CurrentUserResetPasswordRoute };
