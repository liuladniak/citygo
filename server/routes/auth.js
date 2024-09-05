import express from "express";
import initKnex from "knex";
import knexConfig from "../knexfile.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const router = express.Router();
const knex = initKnex(knexConfig["development"]);
import "dotenv/config";

router.post("/signup", async (req, res) => {
  const { first_name, last_name, phone, email, address, password } = req.body;

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).send("Please enter the required fields");
  }

  const hashedPassword = bcrypt.hashSync(password);

  const newUser = {
    first_name,
    last_name,
    phone,
    email,
    address,
    password: hashedPassword,
  };

  try {
    await knex("users").insert(newUser);
    res.status(201).send("Registered successfully");
  } catch (err) {
    console.error(err);
    res.status(400).send("Failed registration");
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Please enter the required fields");
  }

  let user;
  try {
    user = await knex("users").where({ email: email }).first();
    if (!user) {
      return res.status(404).send("Invalid email");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server errored out");
  }

  const isPasswordCorrect = bcrypt.compareSync(password, user.password);
  if (!isPasswordCorrect) {
    return res.status(400).send("Invalid password");
  }
  const expiresIn = 35;
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: expiresIn }
  );

  res.send({ token: token, expiresIn: expiresIn });
});

router.get("/profile", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res
      .status(401)
      .send("Please provide a JWT for authorization or please login");
  }

  const authToken = authHeader.split(" ")[1];

  let decodedToken;
  try {
    decodedToken = jwt.verify(authToken, process.env.JWT_SECRET);
    console.log("JWT Payload: ", decodedToken);
  } catch (err) {
    return res.status(401).send("Invalid auth token");
  }

  const userData = await knex("users").where({ id: decodedToken.id }).first();

  delete userData.password;

  res.status(200).json(userData);
});

export default router;
