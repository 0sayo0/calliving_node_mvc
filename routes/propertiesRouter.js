import express from "express";
import { body } from "express-validator";
import {
  admin,
  create,
  save,
  addImage,
  storeImage,
  edit,
  saveChanges,
  deleteProperty,
  changeStatus,
  showProperty,
  sendMessage,
  seeMessages,
} from "../controllers/propertyController.js";
import protectRoute from "../middleware/protectRoute.js";
import upload from "../middleware/uploadImage.js";
import identifyUser from "../middleware/identifyUser.js";

const router = express.Router();

router.get("/my-properties", protectRoute, admin);
router.get("/properties/create", protectRoute, create);
router.post(
  "/properties/create",
  protectRoute, //Don't forget
  body("title").notEmpty().withMessage("El titulo del anuncio es obligatorio"),
  body("description")
    .notEmpty()
    .withMessage("La descripción no puede ir vacía")
    .isLength({ max: 200 })
    .withMessage("La descripción es muy larga"),
  body("category").isNumeric().withMessage("Selecciona una categoria"),
  body("price").isNumeric().withMessage("Selecciona un rango de precios"),
  body("bedrooms")
    .isNumeric()
    .withMessage("Selecciona la cantidad de habitaciones"),
  body("parking")
    .isNumeric()
    .withMessage("Selecciona la cantidad de estacionamientos"),
  body("bathroom").isNumeric().withMessage("Selecciona la cantidad de baños"),
  body("lat").notEmpty().withMessage("Ubica la propiedad en el mapa"),
  save
);

router.get("/properties/add-image/:id", protectRoute, addImage);

router.post(
  "/properties/add-image/:id",
  protectRoute,
  upload.single("image"), //Bind to addImage.js file via paramName
  storeImage
);

router.get("/properties/edit/:id", protectRoute, edit);

router.post(
  "/properties/edit/:id",
  protectRoute, //Don't forget
  body("title").notEmpty().withMessage("El titulo del anuncio es obligatorio"),
  body("description")
    .notEmpty()
    .withMessage("La descripción no puede ir vacía")
    .isLength({ max: 200 })
    .withMessage("La descripción es muy larga"),
  body("category").isNumeric().withMessage("Selecciona una categoria"),
  body("price").isNumeric().withMessage("Selecciona un rango de precios"),
  body("bedrooms")
    .isNumeric()
    .withMessage("Selecciona la cantidad de habitaciones"),
  body("parking")
    .isNumeric()
    .withMessage("Selecciona la cantidad de estacionamientos"),
  body("bathroom").isNumeric().withMessage("Selecciona la cantidad de baños"),
  body("lat").notEmpty().withMessage("Ubica la propiedad en el mapa"),
  saveChanges
);

router.post("/properties/delete/:id", protectRoute, deleteProperty);

router.put("/properties/:id", protectRoute, changeStatus);

// Public area
router.get("/property/:id", identifyUser, showProperty);

//Store the messages
router.post(
  "/property/:id",
  identifyUser,
  body("message")
    .isLength({ min: 10 })
    .withMessage("El mensaje no puede ir vacio o es muy corto"),
  sendMessage
);

router.get("/messages/:id", protectRoute, seeMessages);

export default router;
