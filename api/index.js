// The ONLY serverless function on Vercel. Every /api/* request is routed here
// (see vercel.json) and handled by the Express app in backend/, which stores
// everything in the Postgres database — nothing is kept in temporary files.
import { createApp } from "../backend/dist/app.js";

const app = createApp();

export default app;
