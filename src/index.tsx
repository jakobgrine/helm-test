import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "./logger.js";
import { logger as requestLogger } from "hono/logger";
import "./env.js";
import { visitLogs } from "./db.js";
import { trainCase } from "change-case";

const app = new Hono();
app.use(requestLogger(logger.http));

app.get("/", async (c) => {
  await visitLogs.create({
    forwardedFor: c.req.header("X-Forwarded-For"),
  });

  const headers = Object.entries(c.req.header())
    .map(([name, value]) => `${trainCase(name)}: ${value}`)
    .join("\n");
  const visits = await visitLogs
    .find()
    .transform((visits) =>
      visits.map((visit) => `${visit.timestamp.toISOString()} ${visit.forwardedFor}`),
    );
  return c.html(
    <>
      <pre>{headers}</pre>
      <p>{visits.length} visit(s) so far</p>
      <pre>{visits.toReversed().join("\n")}</pre>
    </>,
  );
});

const port = Number(process.env.LISTEN_PORT || 3000);
logger.info(`Listening on http://127.0.0.1:${port}`);
serve({
  port,
  fetch: app.fetch,
});
