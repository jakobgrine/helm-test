import { TypeOf, z } from "zod";
import "dotenv/config";
import { logger } from "./logger.js";

const env = z.object({
  MONGODB_CONNECTION_URI: z.string().min(1),
  LISTEN_PORT: z
    .string()
    .refine((value) => {
      const number = Number(value);
      return 0 < number && number < 65536;
    }, "Invalid port")
    .optional(),
});

const result = env.safeParse(process.env);
if (!result.success) {
  logger.error(
    "Invalid environment variables: " +
      result.error.errors
        .map((error) => `${error.path.join(".")} (${error.message})`)
        .join(", "),
  );
  process.exit(1);
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends TypeOf<typeof env> {}
  }
}
