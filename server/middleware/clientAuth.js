// import jwt from "jsonwebtoken";
// import "dotenv/config";

// export const requireClientAuth = (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader?.startsWith("Bearer ")) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }

//   const token = authHeader.split(" ")[1];
//   jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//     if (err) return res.status(401).json({ error: "Invalid or expired token" });
//     req.userId = decoded.id;
//     next();
//   });
// };

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

export const requireClientAuth = async (req, res, next) => {
  console.log("requireClientAuth hit:", req.method, req.path);
  console.log("auth header:", req.headers.authorization);
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.userId = user.id;
  req.userEmail = user.email;
  next();
};
