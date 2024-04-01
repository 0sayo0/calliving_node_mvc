import { unlink } from "node:fs/promises";
import { validationResult } from "express-validator";
import { Price, Category, Property, Message, User } from "../models/index.js";
import { isSeller, formatDate } from "../helpers/index.js";

const admin = async (req, res) => {
  // Read QueryString
  const { page: actualPage } = req.query;

  const expression = /^[1-9]$/;

  if (!expression.test(actualPage)) {
    return res.redirect("/my-properties?page=1");
  }

  try {
    const { id } = req.user;

    //Limits and offset for the pager
    const limit = 10;
    const offset = actualPage * limit - limit;

    const [properties, total] = await Promise.all([
      Property.findAll({
        limit,
        offset,
        where: {
          userId: id,
        },
        include: [
          { model: Category, as: "category" },
          { model: Price, as: "price" },
          { model: Message, as: "messages" },
        ],
      }),
      Property.count({
        where: {
          userId: id,
        },
      }),
    ]);

    res.render("properties/admin", {
      page: "Mis propiedades",
      properties,
      csrfToken: req.csrfToken(),
      pages: Math.ceil(total / limit),
      actualPage: Number(actualPage),
      total,
      offset,
      limit,
    });
  } catch (error) {
    console.error(error);
  }
};

const create = async (req, res) => {
  //Consult price model and categories
  const [categories, prices] = await Promise.all([
    Category.findAll(),
    Price.findAll(),
  ]);

  res.render("properties/create", {
    page: "Crear propiedad",
    csrfToken: req.csrfToken(),
    categories, //The object literal is used here.
    prices,
    data: {},
  });
};

const save = async (req, res) => {
  //Validation
  let result = validationResult(req);

  if (!result.isEmpty()) {
    const [categories, prices] = await Promise.all([
      Category.findAll(),
      Price.findAll(),
    ]);

    return res.render("properties/create", {
      page: "Crear propiedad",
      csrfToken: req.csrfToken(),
      categories, //The object literal is used here.
      prices,
      errors: result.array(),
      data: req.body,
    });
  }

  //Create a record

  const {
    title,
    description,
    bedrooms,
    parking,
    bathroom,
    street,
    lat,
    lng,
    price: priceId,
    category: categoryId,
  } = req.body;

  const { id: userId } = req.user;

  try {
    const savedProperty = await Property.create({
      title,
      description,
      bedrooms,
      parking,
      bathroom,
      street,
      lat,
      lng,
      priceId,
      categoryId,
      userId,
      image: "",
    });

    const { id } = savedProperty;

    res.redirect(`/properties/add-image/${id}`);
  } catch (error) {
    console.error(error);
  }
};

const addImage = async (req, res) => {
  const { id } = req.params;

  //Validate that the property exists
  const property = await Property.findByPk(id);
  if (!property) {
    return res.redirect("/my-properties");
  }

  //Validate that the property isn't published
  if (property.published) {
    return res.redirect("/my-properties");
  }

  //Validate that the property belongs to whoever visits this page
  if (req.user.id.toString() !== property.userId.toString()) {
    return res.redirect("/my-properties");
  }

  res.render("properties/add-image", {
    page: `Agregar imagen: ${property.title}`,
    csrfToken: req.csrfToken(),
    property,
  });
};

const storeImage = async (req, res, next) => {
  const { id } = req.params;

  //Validate that the property exists
  const property = await Property.findByPk(id);
  if (!property) {
    return res.redirect("/my-properties");
  }

  //Validate that the property isn't published
  if (property.published) {
    return res.redirect("/my-properties");
  }

  //Validate that the property belongs to whoever visits this page
  if (req.user.id.toString() !== property.userId.toString()) {
    return res.redirect("/my-properties");
  }

  try {
    console.log(req.file);
    //Store the image and publish the property
    property.image = req.file.filename;
    property.published = 1;

    await property.save();

    next();
  } catch (error) {
    console.error(error);
  }
};

const edit = async (req, res) => {
  const { id } = req.params;

  //Validate that the property exist
  const property = await Property.findByPk(id);

  if (!property) {
    return res.redirect("/my-properties");
  }

  //Check that whoever visits the URL is the once who created the property
  if (property.userId.toString() !== req.user.id.toString()) {
    return res.redirect("/my-properties");
  }

  //Consult price model and categories
  const [categories, prices] = await Promise.all([
    Category.findAll(),
    Price.findAll(),
  ]);

  res.render("properties/edit", {
    page: `Editar propiedad: ${property.title}`,
    csrfToken: req.csrfToken(),
    categories, //The object literal is used here.
    prices,
    data: property,
  });
};

const saveChanges = async (req, res) => {
  //Verify the validation
  let result = validationResult(req);

  if (!result.isEmpty()) {
    const [categories, prices] = await Promise.all([
      Category.findAll(),
      Price.findAll(),
    ]);

    return res.render("properties/edit", {
      page: "Editar propiedad",
      csrfToken: req.csrfToken(),
      categories, //The object literal is used here.
      prices,
      errors: result.array(),
      data: req.body,
    });
  }

  const { id } = req.params;

  //Validate that the property exist
  const property = await Property.findByPk(id);

  if (!property) {
    return res.redirect("/my-properties");
  }

  //Check that whoever visits the URL is the once who created the property
  if (property.userId.toString() !== req.user.id.toString()) {
    return res.redirect("/my-properties");
  }

  //Rewrite the object and uptdate it
  try {
    const {
      title,
      description,
      bedrooms,
      parking,
      bathroom,
      street,
      lat,
      lng,
      price: priceId,
      category: categoryId,
    } = req.body;

    property.set({
      title,
      description,
      bedrooms,
      parking,
      bathroom,
      street,
      lat,
      lng,
      priceId,
      categoryId,
    });

    await property.save();

    res.redirect("/my-properties");
  } catch (error) {
    console.error(error);
  }
};

const deleteProperty = async (req, res) => {
  const { id } = req.params;

  //Validate that the property exist
  const property = await Property.findByPk(id);

  if (!property) {
    return res.redirect("/my-properties");
  }

  //Check that whoever visits the URL is the once who created the property
  if (property.userId.toString() !== req.user.id.toString()) {
    return res.redirect("/my-properties");
  }

  //Delete the image
  await unlink(`public/uploads/${property.image}`);

  console.log(`Se elimino la imagen ${property.image}`);

  //Delete the property
  await property.destroy();
  res.redirect("/my-properties");
};

//Modify the property status
const changeStatus = async (req, res) => {
  const { id } = req.params;

  //Validate that the property exist
  const property = await Property.findByPk(id);

  if (!property) {
    return res.redirect("/my-properties");
  }

  //Check that whoever visits the URL is the once who created the property
  if (property.userId.toString() !== req.user.id.toString()) {
    return res.redirect("/my-properties");
  }

  //Uptdate
  property.published = !property.published;

  await property.save();

  res.json({
    result: true,
  });
};

//Show a property
const showProperty = async (req, res) => {
  const { id } = req.params;

  //Check that the property exists
  const property = await Property.findByPk(id, {
    include: [
      { model: Price, as: "price" },
      { model: Category, as: "category" },
    ],
  });

  if (!property || !property.published) {
    return res.redirect("/404");
  }

  res.render("properties/show", {
    property,
    page: property.title,
    csrfToken: req.csrfToken(),
    user: req.user,
    isSeller: isSeller(req.user?.id, property.userId),
  });
};

const sendMessage = async (req, res) => {
  const { id } = req.params;

  //Check that the property exists
  const property = await Property.findByPk(id, {
    include: [
      { model: Price, as: "price" },
      { model: Category, as: "category" },
    ],
  });

  if (!property) {
    return res.redirect("/404");
  }

  //Render errors
  //Validation
  let result = validationResult(req);

  if (!result.isEmpty()) {
    return res.render("properties/show", {
      property,
      page: property.title,
      csrfToken: req.csrfToken(),
      user: req.user,
      isSeller: isSeller(req.user?.id, property.userId),
      errors: result.array(),
    });
  }

  const { message } = req.body;
  const { id: propertyId } = req.params;
  const { id: userId } = req.user;

  //Store the message
  await Message.create({
    message,
    propertyId,
    userId,
  });

  res.redirect("/");

  // console.log("MESSAGE RECEIVED: ", req.body.message);
};

//Read received messages
const seeMessages = async (req, res) => {
  const { id } = req.params;

  //Validate that the property exist
  const property = await Property.findByPk(id, {
    include: [
      {
        model: Message,
        as: "messages",
        include: [{ model: User.scope("deletePassword") /*as: "user"*/ }],
      },
    ],
  });

  if (!property) {
    return res.redirect("/my-properties");
  }

  //Check that whoever visits the URL is the once who created the property
  if (property.userId.toString() !== req.user.id.toString()) {
    return res.redirect("/my-properties");
  }

  res.render("properties/messages", {
    page: "Mensajes",
    messages: property.messages,
    formatDate,
  });
};

export {
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
};
