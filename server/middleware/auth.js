import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Checks a Supabase access token and looks up the user's role.
// Shared by the HTTP middleware below and the Milo live-chat sockets.
export async function authenticateToken(token) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) return null;

  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  return { user, role: roleData?.role ?? null };
}

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Missing or invalid authorization header" });
  }

  const token = authHeader.split(" ")[1];
  const auth = await authenticateToken(token);
  if (!auth) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.user = auth.user;
  req.role = auth.role;
  next();
}

// For public pages that show a bit more to signed-in staff (draft tours, say).
// A missing or bad token simply means "visitor"; it is never an error here.
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const auth = await authenticateToken(authHeader.split(" ")[1]);
      if (auth) {
        req.user = auth.user;
        req.role = auth.role;
      }
    } catch (err) {
      console.error("optionalAuth failed:", err.message);
    }
  }
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.role || !roles.includes(req.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

// Any signed-in person with a staff role. A guest with a Supabase account has no role.
export function requireStaff(req, res, next) {
  if (!req.role) {
    return res.status(403).json({ error: "Insufficient permissions" });
  }
  next();
}
