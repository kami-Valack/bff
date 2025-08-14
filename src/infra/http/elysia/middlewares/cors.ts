import type { Context } from "elysia";
import { _env } from "@/src/infra/config/_env";

const allowedOrigins = _env.CORS_ALLOWED_ORIGINS.split(",");

export const handleCors = () => {
	return ({ request, set }: Context) => {
		const origin = request.headers.get("origin");

		if (origin && allowedOrigins.includes(origin)) {
			set.headers["Access-Control-Allow-Origin"] = origin;
			set.headers["Access-Control-Allow-Credentials"] = "true";
			set.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
			set.headers["Access-Control-Allow-Headers"] =
				"Content-Type, Authorization, x-access-token, Accept, Origin, X-Requested-With";
			set.headers["Access-Control-Expose-Headers"] =
				"Content-Type, Authorization, x-access-token";
			set.headers["Access-Control-Max-Age"] = "86400";
		}

		if (request.method === "OPTIONS") {
			set.status = 204;
			return;
		}
	};
};
