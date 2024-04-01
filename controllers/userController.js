import { check, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { generateJWT, generateId } from "../helpers/tokens.js";
import { emailRegister, emailForgotPassword } from "../helpers/emails.js";

const loginForm = (req, res) => {
  res.render("auth/login", {
    page: "Iniciar sesion",
    csrfToken: req.csrfToken(),
  });
};

const authenticate = async (req, res) => {
  //Validation
  await check("email")
    .isEmail()
    .withMessage("El email es obligatorio")
    .run(req);
  await check("password")
    .notEmpty()
    .withMessage("El password es obligatorio")
    .run(req);

  let result = validationResult(req);

  //Verify that result is empty
  if (!result.isEmpty()) {
    //Errors
    return res.render("auth/login", {
      page: "Iniciar sesión",
      csrfToken: req.csrfToken(),
      errors: result.array(),
    });
  }

  //Check if the user exist
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.render("auth/login", {
      page: "Iniciar sesión",
      csrfToken: req.csrfToken(),
      errors: [{ msg: "El usuario no existe" }],
    });
  }

  //Check if the user has been confirmed
  if (!user.confirmed) {
    return res.render("auth/login", {
      page: "Iniciar sesión",
      csrfToken: req.csrfToken(),
      errors: [{ msg: "Tu cuenta no ha sido confirmada" }],
    });
  }

  //Check the password
  if (!user.verifyPassword(password)) {
    return res.render("auth/login", {
      page: "Iniciar sesión",
      csrfToken: req.csrfToken(),
      errors: [{ msg: "El password es incorrecto" }],
    });
  }

  //Authenticate the user
  const token = generateJWT({ id: user.id, name: user.name });
  console.log(token);

  //Store in a cookie
  return res
    .cookie("_token", token, {
      httpOnly: true, //Avoid Cross-site atacks
      //secure: true, /** Allow cookies only with safe networks, is better with SSL sertificate */
      //sameSite: true, //Is better with SSL sertificate
    })
    .redirect("/my-properties");
};

const logOut = (req, res) => {
  return res.clearCookie("_token").status(200).redirect("/auth/login");
};

const signUpForm = (req, res) => {
  res.render("auth/signup", {
    page: "Crear cuenta",
    csrfToken: req.csrfToken(),
  });
};

const toRegister = async (req, res) => {
  //Validation
  await check("name")
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .run(req);
  await check("email").isEmail().withMessage("Eso no parece un email").run(req);
  await check("password")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe ser de al menos 6 caracteres")
    .run(req);
  await check("repeat_password")
    // .equals("password") //Error 'cause it ferify that word be "password" literally
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Las contraseñas no son iguales")
    .run(req);

  let result = validationResult(req);

  // return res.json(result.array());

  //Verify that result is empty
  if (!result.isEmpty()) {
    //Errors
    return res.render("auth/signup", {
      page: "Crear cuenta",
      csrfToken: req.csrfToken(),
      errors: result.array(),
      user: {
        name: req.body.name,
        email: req.body.email,
      },
    });
  }

  //Verify that the user is not duplicate
  const { name, email, password } = req.body;

  const existUser = await User.findOne({ where: { email } });
  if (existUser) {
    return res.render("auth/signup", {
      page: "Crear cuenta",
      csrfToken: req.csrfToken(),
      errors: [{ msg: "El usuario ya esta registrado" }],
      user: {
        name: req.body.name,
        email: req.body.email,
      },
    });
  }

  //Store a user
  const user = await User.create({
    name,
    email,
    password,
    token: generateId(),
  });

  //Send confirmation email
  emailRegister({
    name: user.name,
    email: user.email,
    token: user.token,
  });

  //Show confirmation message
  res.render("templates/message", {
    page: "Cuenta creada correctamente",
    message:
      "Hemos enviado un email de confirmacion a tu correo, presiona en el enlace",
  });
};

//Function that verifies an account
const toConfirm = async (req, res) => {
  //It is used to pass control to the next middleware in the request processing stack.
  const { token } = req.params;

  //Verify if the token is valid
  const user = await User.findOne({ where: { token } });

  if (!user) {
    return res.render("auth/confirm-account", {
      page: "Error al confirmar tu cuenta",
      message: "Hubo un rerror al confirmar tu cuenta, intenta de nuevo",
      error: true,
    });
  }

  //Confirm account
  user.token = null;
  user.confirmed = true;
  await user.save();

  res.render("auth/confirm-account", {
    page: "Cuenta confirmada",
    message: "La cuenta se confirmo correctamente",
  });
};

const forgotPasswordForm = (req, res) => {
  res.render("auth/forgot-password", {
    page: "Recuperar contraseña",
    csrfToken: req.csrfToken(),
  });
};

const resetPassword = async (req, res) => {
  //Validation
  await check("email").isEmail().withMessage("Eso no parece un email").run(req);

  let result = validationResult(req); //validationResult() is a Express-Validator function

  //Verify that result is empty
  if (!result.isEmpty()) {
    //Errors
    return res.render("auth/forgot-password", {
      page: "Recuperar contraseña",
      csrfToken: req.csrfToken(),
      errors: result.array(),
    });
  }

  //Search the user

  const { email } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.render("auth/forgot-password", {
      page: "Recuperar contraseña",
      csrfToken: req.csrfToken(),
      errors: [{ msg: "El email no pertenece a ningun usuario" }],
    });
  }

  //Generate token and send email
  user.token = generateId();
  await user.save();

  //Send a email
  emailForgotPassword({
    email,
    name: user.name,
    token: user.token,
  });

  //Render a message
  res.render("templates/message", {
    page: "Reestablece tu password",
    message: "Hemos enviado un email con las instrucciones",
  });
};

const checkToken = async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({ where: { token } });
  if (!user) {
    return res.render("auth/confirm-account", {
      page: "Reestablece tu password",
      message: "Hubo un rerror al validar tu informacion, intenta de nuevo",
      error: true,
    });
  }

  //Show form to modify password
  res.render("auth/reset-password", {
    page: "Reestablece tu password",
    csrfToken: req.csrfToken(),
  });
};

const newPassword = async (req, res) => {
  //Validate password
  await check("password")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe ser de al menos 6 caracteres")
    .run(req);

  let result = validationResult(req);

  //Verify that result is empty
  if (!result.isEmpty()) {
    //Errors
    return res.render("auth/reset-password", {
      page: "Reestablece tu password",
      csrfToken: req.csrfToken(),
      errors: result.array(),
    });
  }

  const { token } = req.params;
  const { password } = req.body;

  //Identify who makes the change
  const user = await User.findOne({ where: { token } });

  //Hash the password
  const salt = await bcrypt.genSalt(10); //Generate a salt for the password hash
  user.password = await bcrypt.hash(password, salt);

  user.token = null;

  await user.save();

  res.render("auth/confirm-account", {
    page: "Password reestablecido",
    message: "El password se guardo correctamente",
  });
};

export {
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
};
