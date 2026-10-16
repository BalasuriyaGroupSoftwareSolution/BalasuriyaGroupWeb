import { createApp } from "./app.js";
import { env } from "./config/env.js";
const app = createApp();
app.listen(env.port, () => {
    console.log(`Balasuriya Group API listening on port ${env.port} (${env.nodeEnv})`);
});
//# sourceMappingURL=server.js.map