import { Sequelize } from "sequelize";
import { Price, Category, Property } from "../models/index.js";

const home = async (req, res) => {
  const categories = await Category.findAll({ raw: true });
  const prices = await Price.findAll({ raw: true });

  const [houses, departments] = await Promise.all([
    Property.findAll({
      limit: 3,
      where: {
        categoryId: 1,
      },
      include: [
        {
          model: Price,
          as: "price",
        },
      ],
      order: [["createdAt", "DESC"]],
    }),
    Property.findAll({
      limit: 3,
      where: {
        categoryId: 2,
      },
      include: [
        {
          model: Price,
          as: "price",
        },
      ],
      order: [["createdAt", "DESC"]],
    }),
  ]);

  res.render("home", {
    page: "Inicio",
    categories,
    prices,
    houses,
    departments,
    csrfToken: req.csrfToken(),
  });
};

const category = async (req, res) => {
  const { id } = req.params;

  //Check that the category exists
  const category = await Category.findByPk(id);
  if (!category) {
    return res.redirect("/404");
  }

  //Get the category properties
  const properties = await Property.findAll({
    where: {
      categoryId: id,
    },
    include: [{ model: Price, as: "price" }],
  });

  res.render("category", {
    page: `${category.name}s en venta`,
    properties,
    csrfToken: req.csrfToken(),
  });
};

const notFound = (req, res) => {
  res.render("404", {
    page: "No encontrada",
    csrfToken: req.csrfToken(),
  });
};

const browser = async (req, res) => {
  const { term } = req.body;

  //Verify that term is not empty
  if (!term.trim()) {
    return res.redirect("back");
  }

  //Consult the properties
  const properties = await Property.findAll({
    where: {
      title: {
        [Sequelize.Op.like]: "%" + term + "%", //Search anywhere in the "title"
      },
    },
    include: [{ model: Price, as: "price" }],
  });

  res.render("search", {
    page: "Resultados de la búsqueda",
    properties,
    csrfToken: req.csrfToken(),
  });
};

export { home, category, notFound, browser };
