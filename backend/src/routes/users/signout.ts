import express from "express";
import { requireAuth } from "./../../middlewares";

const router = express.Router();

/**
 * @openapi
 * /api/v1/users/signout:
 *   post:
 *     tags:
 *        - Auth
 *     description: Enables user to log out of his/her account.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     parameters:
 *     responses:
 *       200:
 *         description: . Successfully logged our from  your account.
 */
router.post("/api/v1/users/signout", requireAuth, (req, res) => {
  req.currentUser = undefined;

  res.status(200).send({ status: "success", message: "Welcome Back!!" });
});

export { router as signOutRouter };
