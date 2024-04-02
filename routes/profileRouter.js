import express from "express";
import { profile } from "../controllers/profileController.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/my-profile", protectRoute, profile);

export default router;
