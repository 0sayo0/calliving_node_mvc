import express from "express";
import {
  loginForm,
  authenticate,
  logOut,
  signUpForm,
  toRegister,
  toConfirm,
  forgotPasswordForm,
  resetPassword,
  checkToken,
  newPassword,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/login", loginForm);
router.post("/login", authenticate);

//Log out
router.post("/logout", logOut);

router.get("/sign-up", signUpForm);
router.post("/sign-up", toRegister);

router.get("/confirm/:token", toConfirm);

router.get("/forgot-password", forgotPasswordForm);
router.post("/forgot-password", resetPassword);

//Store the new password
router.get("/forgot-password/:token", checkToken);
router.post("/forgot-password/:token", newPassword);

export default router;
