import { Request, Response, Router } from "express";
import { requireAuth } from "./../../middlewares";
import { User } from "./../../models/user";
import { NotAuthorizedError } from "../../errors/not-authorized-error";
import { body } from "express-validator";
import { validateRequest } from "../../middlewares/validate-request";
import { BadRequestError } from "../../errors/bad-request-error";

const router = Router();

/**
 * @openapi
 * /api/v1/users/update-profile:
 *   patch:
 *     tags:
 *        - Auth
 *     description: Enables new users to update  their account.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     parameters:
 *        - name: email
 *          description: Email Address
 *        - name: first_name
 *          description: User first name
 *        - name: last_name
 *          description: User last name
 *        - name: first_name
 *          description: User first name
 *        - name: photo
 *          description: User photo
 *        - name: location
 *          description: User location
 *     responses:
 *       200:
 *         description: . Successfully updated your account.
 */
router.post(
  "/api/v1/users/update-profile",
  [body("email").isEmail().withMessage("please provide your email address")],
  validateRequest,
  requireAuth,
  async (req: Request, res: Response) => {
    const { email, first_name, last_name, photo, location } = req.body;
    const user = await User.findById(req.currentUser?.id!);

    if (email?.toLowerCase() !== user?.email?.toLowerCase()) {
      const isEmailTaken = await User.findOne({ email });
      if (isEmailTaken) {
        throw new BadRequestError("Username is already taken");
      }
    }

    if (!user) {
      throw new NotAuthorizedError();
    }

    // update profile
    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      {
        email,
        first_name,
        last_name,
        photo,
        location,
      },
      { new: true }
    );

    res.status(200).send({
      status: "success",
      message: "updated your profile",
      user: updatedUser,
    });
  }
);

export { router as UserUpdateProfileRoute };
