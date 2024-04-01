import express from "express";
import {
  home,
  category,
  notFound,
  browser,
} from "../controllers/appController.js";

const router = express.Router();

//Homepage
router.get("/", home);

//Categories
router.get("/categories/:id", category);

//Page 404
router.get("/404", notFound);

//Browser
router.post("/browser", browser);

export default router;
