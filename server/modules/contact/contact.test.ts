import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { startApp } from "../../test/app.js";
import contact from "./contact.routes.js";

const mail = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock("../../services/emailService.js", () => ({ sendContactFormEmail: mail.send }));

let app: Awaited<ReturnType<typeof startApp>>;
beforeAll(async () => (app = await startApp(contact)));
afterAll(() => app.close());

const valid = { first_name: " Ayla ", last_name: "Demir", email: " Ayla@Example.TEST ", message: "Hello, I have a question about tours." };

describe("POST /", () => {
  it("answers at once, cleans the input and sends the email", async () => {
    mail.send.mockResolvedValueOnce(undefined);
    const res = await app.post("/", { ...valid, phone: "  +90 555 123  " });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Message sent successfully." });
    expect(mail.send).toHaveBeenCalledWith({
      name: "Ayla Demir", email: "ayla@example.test", phone: "+90 555 123", message: valid.message,
    });
  });

  it("still tells the visitor it worked when the email provider fails", async () => {
    mail.send.mockRejectedValueOnce(new Error("smtp down"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await app.post("/", valid)).status).toBe(200);
  });

  it("shows the visitor a readable reason", async () => {
    const cases: [object, string][] = [
      [{ ...valid, first_name: "" }, "Please fill in all required fields."],
      [{ ...valid, last_name: undefined }, "Please fill in all required fields."],
      [{ ...valid, email: "nope" }, "Please enter a valid email address."],
      [{ ...valid, message: "short" }, "Message is too short."],
      [{ ...valid, message: "x".repeat(2001) }, "Message is too long (max 2000 characters)."],
      [{ ...valid, first_name: "x".repeat(101) }, "Name is too long."],
    ];
    mail.send.mockClear();
    for (const [body, error] of cases) {
      const res = await app.post("/", body);
      expect(res.status).toBe(400);
      expect(res.body.error).toBe(error);
    }
    expect(mail.send).not.toHaveBeenCalled();
  });
});
