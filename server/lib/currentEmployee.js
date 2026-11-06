export async function getCurrentEmployee(db, req) {
  const email = req.user?.email;
  if (!email) return null;
  return db("employees")
    .where("email", email)
    .orWhere("work_email", email)
    .first();
}
