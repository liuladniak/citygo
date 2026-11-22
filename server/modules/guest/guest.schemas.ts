import { z } from "zod";
import { id } from "../../lib/schemas.js";

// The site still sends its own id; it is only checked against the signed-in guest, never trusted.
export const bookingsQuery = z.object({ userId: id.optional() });

export type BookingsQuery = z.infer<typeof bookingsQuery>;
