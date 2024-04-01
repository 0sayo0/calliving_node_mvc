import express from "express";
import csrf from "csurf";
import cookieParser from "cookie-parser";
import userRouter from "./routes/userRouter.js";
import propertiesRouter from "./routes/propertiesRouter.js";
import appRouter from "./routes/appRouter.js";
import apiRouter from "./routes/apiRouter.js";
import db from "./config/db.js";

//Create the app
const app = express();

//Enable data reading
app.use(express.urlencoded({ extended: true }));

//Enable Cookie Parser
app.use(cookieParser());

//Enable CSRF
app.use(csrf({ cookie: true }));

//Connection to database
try {
  await db.authenticate(); //authenticate is a Sequelize method that attempts to authenticate the database
  db.sync(); //Create table if no exist
  console.log("Successful connection to the database");
} catch (error) {
  console.error(error);
}

//Enable pug
app.set("view engine", "pug");
app.set("views", "./views");

//Public folder
app.use(express.static("public"));

//Routing
app.use("/", appRouter);
app.use("/auth", userRouter);
app.use("/", propertiesRouter);
app.use("/api", apiRouter);

//Define a port and start the project
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`The server is running on port ${port}`);
});
