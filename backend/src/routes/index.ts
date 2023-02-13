import {} from "./..";
import { app } from "./../app";
import {
  CurrentUserRoutes,
  UserUpdateProfileRoute,
  CurrentUserResetPasswordRoute,
  SignInRoutes,
  signOutRouter,
  UserSignUpRoutes,
  UserResetPasswordResetRoutes,
  UserRequestPasswordResetRoutes,
} from "./users";

app.use([
  UserResetPasswordResetRoutes,
  UserRequestPasswordResetRoutes,
  SignInRoutes,
  UserSignUpRoutes,
  signOutRouter,
  CurrentUserRoutes,
  UserUpdateProfileRoute,
  CurrentUserResetPasswordRoute,
]);
