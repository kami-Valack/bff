import { _env } from "./infra/config/_env";
import { app } from "./infra/http/elysia/app";

async function startServer() {
	app.listen(_env.PORT, () => {
		console.log(`✅ HTTP server started on port ${_env.PORT}`);
	});
}

startServer();
