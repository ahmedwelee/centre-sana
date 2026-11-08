import { createApp } from "./app.js";
const { app, db } = createApp();
const port = Number(process.env.PORT) || 4301;
const server = app.listen(port, process.env.HOST || "127.0.0.1", () =>
  console.log(`Sana API ready at http://127.0.0.1:${port}`),
);
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () =>
    server.close(() => {
      db.close();
      process.exit(0);
    }),
  );
