import type { Context } from "elysia";

const allowedOrigins = [
	"https://djezyas.com",
	"https://www.djezyas.com",
	"http://localhost:3000",
	"http://localhost:7878",
];

export const handlePreflight = () => {
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
			console.log("Preflight CORS headers set for origin:", origin);
		} else {
			console.log("Preflight - Origin not allowed or missing:", origin);
		}

		set.status = 204;
		return;
	};
};
