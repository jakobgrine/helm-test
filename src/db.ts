import mongoose, { Schema } from "mongoose";
import { logger } from "./logger.js";

export const visitLogs = mongoose.model(
  "VisitLog",
  new Schema({
    timestamp: { type: Date, default: Date.now },
    forwardedFor: String,
  }),
  "visitLogs",
);

const connection = mongoose.createConnection(
  process.env.MONGODB_CONNECTION_URI,
);
const client = connection.getClient();
const { host, port } = client.options.hosts[0];
const user = client.options.credentials?.username;
await connection.close();

const authentication = user ? `with user ${user}` : "anonymously";
const info = `${host}:${port} ${authentication}`;
logger.info(`Connecting to MongoDB at ${info}`);

await mongoose.connect(process.env.MONGODB_CONNECTION_URI);
logger.info(`Connected to MongoDB at ${info}`);
