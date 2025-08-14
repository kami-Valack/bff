import { renderGraphiQL } from "graphql-yoga";
import { _env } from "@/src/infra/config/_env";

export function graphiqlAuthHandler(request: Request) {
	const auth = request.headers.get("authorization");
	const expectedUser = _env.SWAGGER_DOCS_USERNAME;
	const expectedPass = _env.SWAGGER_DOCS_PASSWORD;
	if (!auth || !auth.startsWith("Basic ")) {
		return new Response("Unauthorized", {
			status: 401,
			headers: { "WWW-Authenticate": 'Basic realm="GraphiQL"' },
		});
	}
	const [, encoded] = auth.split(" ");
	const decoded = Buffer.from(encoded, "base64").toString();
	const [user, pass] = decoded.split(":");
	if (user !== expectedUser || pass !== expectedPass) {
		return new Response("Unauthorized", { status: 401 });
	}
	return new Response(renderGraphiQL({ endpoint: "/graphql" }), {
		headers: { "Content-Type": "text/html" },
	});
}
