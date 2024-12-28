import { Hono } from "hono";
import { chatController } from "../controllers/chat-controller";

const router = new Hono();

router.get("/", (c) => {
  return c.text("Hello Hono!");
});

router.post("/chat", chatController);

export default router;
