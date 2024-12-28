import { Hono } from "hono";
import router from "./https/routes";

const app = new Hono();

app.route("/", router);

export default app;
