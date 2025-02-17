import express from "express";
import initKnex from "knex";
import knexConfig from "../knexfile.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const router = express.Router();
const knex = initKnex(knexConfig["development"]);
import "dotenv/config";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send("Authorization token required.");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).send("No token found.");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send("Invalid or expired token.");
    }

    req.userId = decoded.id;
    next();
  });
};

router.post("/signup", async (req, res) => {
  const { first_name, last_name, phone_number, email, password } = req.body;

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).send("Please enter the required fields");
  }

  const hashedPassword = bcrypt.hashSync(password);

  const phoneNumber = req.body.phone_number || null;

  const newUser = {
    first_name,
    last_name,
    phone_number: phoneNumber,
    email,
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
  const expiresIn = 60 * 1000;
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
  } catch (err) {
    return res.status(401).send("Invalid auth token");
  }
  try {
    const userData = await knex("users")
      .select(
        "id",
        "first_name",
        "last_name",
        "preferred_name",
        "notification_preference",
        "gift_credit",
        knex.raw(`
      CASE 
        WHEN email IS NULL OR email = '' THEN 'No email provided'
        ELSE LEFT(email, 1) || '****' || SUBSTRING(email FROM POSITION('@' IN email)) 
      END AS email
    `),
        knex.raw(`
      CASE 
        WHEN phone_number IS NULL OR phone_number = '' THEN 'No phone number provided'
        ELSE 
          SUBSTRING(phone_number, 1, 2) || 
          REPEAT('*', GREATEST(LENGTH(phone_number) - 6, 0)) || 
          SUBSTRING(phone_number, LENGTH(phone_number) - 3, 4) 
      END AS phone_number
    `),
        knex.raw(`
      CASE 
        WHEN emergency_contact IS NULL OR emergency_contact = '' THEN 'Not provided'
        ELSE 
          SUBSTRING(emergency_contact, 1, 2) || 
          REPEAT('*', GREATEST(LENGTH(emergency_contact) - 6, 0)) || 
          SUBSTRING(emergency_contact, LENGTH(emergency_contact) - 3, 4) 
      END AS emergency_contact
    `)
      )

      .where({ id: decodedToken.id })
      .first();

    delete userData.password;

    if (!userData) {
      return res.status(404).send("User not found");
    }
    res.status(200).json(userData);
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).send("Internal Server Error");
  }
});
router.post("/test-login", async (req, res) => {
  try {
    const user = await knex("users")
      .where({ email: "test@example.com" })
      .first();

    if (!user) {
      return res.status(404).send("Test user not found in the database.");
    }

    const expiresIn = 60 * 1000;
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    res.status(200).json({
      message: "Test user logged in successfully",
      token: token,
      expiresIn: expiresIn,
    });
  } catch (err) {
    console.error("Error logging in test user:", err);
    res.status(500).send("Server error");
  }
});

router.put("/profile", verifyToken, async (req, res) => {
  const {
    first_name,
    last_name,
    preferred_name,
    email,
    phone_number,
    emergency_contact,
    notification_preference,
    gift_credit,
  } = req.body;

  const updatedUser = {};

  if (first_name) updatedUser.first_name = first_name;
  if (last_name) updatedUser.last_name = last_name;
  if (preferred_name) updatedUser.preferred_name = preferred_name;
  if (email) updatedUser.email = email;
  if (phone_number) updatedUser.phone_number = phone_number;
  if (emergency_contact) updatedUser.emergency_contact = emergency_contact;
  if (notification_preference !== undefined)
    updatedUser.notification_preference = notification_preference;
  if (gift_credit !== undefined) updatedUser.gift_credit = gift_credit;

  if (Object.keys(updatedUser).length === 0) {
    return res.status(400).send("At least one field must be updated");
  }

  try {
    if (!req.userId) {
      return res.status(401).send("User not authenticated");
    }

    await knex("users").where({ id: req.userId }).update(updatedUser);

    res.status(200).send("User profile updated successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error while updating user profile");
  }
});

export default router;
