import bcrypt from "bcrypt";

const users = [
  {
    name: "Sayo Morales",
    email: "jonathan.sayo.29@gmail.com",
    confirmed: 1,
    password: bcrypt.hashSync("jonymaxter16", 10),
  },
];

export default users;
