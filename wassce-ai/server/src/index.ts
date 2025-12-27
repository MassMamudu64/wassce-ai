import dotenv from "dotenv";

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH ?? "server/.env" });

const { ensureSchema } = await import("./db");
const { createApp } = await import("./app");
const { config } = await import("./config");

const start = async () => {
  await ensureSchema();
  const app = createApp();
  app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[api] listening on :${config.port}`);
  });
};

start().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
