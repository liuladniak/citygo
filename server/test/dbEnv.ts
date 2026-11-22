// Dummy values so route modules that read env at import time can load in database tests.
process.env.STRIPE_SECRET_KEY ??= "sk_test_dummy";
process.env.ALLOWED_ORIGINS ??= "http://localhost:5173";
process.env.SUPABASE_URL ??= "http://localhost:54321";
process.env.SUPABASE_SERVICE_KEY ??= "dummy";
