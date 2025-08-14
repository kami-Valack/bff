import { yoga } from "@elysiajs/graphql-yoga";
import { Elysia } from "elysia";
import { appResolvers, appTypeDefs, graphqlMiddlewares } from "../graphql/graphql-setup";
import { handleCors } from "./middlewares/cors";
import { handlePreflight } from "./middlewares/preflight";
import { graphiqlAuthHandler } from "./plugins/graphiql-auth";

export const app = new Elysia()
	.derive(handleCors())
	.use(
		yoga({
			typeDefs: appTypeDefs,
			resolvers: appResolvers,
			graphiql: false,
			path: "graphql",
			context: async ({ request }) => {
				const token = request.headers.get("x-access-token");
				const ip = request.headers.get("x-forwarded-for") || 
					request.headers.get("x-real-ip") || 
					"unknown";

				return {
					xAccessToken: token,
					ip,
					headers: Object.fromEntries(request.headers.entries()),
					path: request.url,
				};
			},
			// Aplica middlewares customizados
			plugins: graphqlMiddlewares,
			maskedErrors: {
				maskError: (
					error: unknown,
					message: string,
					isDev?: boolean,
				): Error => {
					// Log estruturado de erros
					console.error("🚨 GraphQL Error:", {
						timestamp: new Date().toISOString(),
						error: error instanceof Error ? error.message : String(error),
						errorType: error?.constructor?.name,
						message,
						isDev,
						stack: error instanceof Error ? error.stack : undefined,
					});

					// Se já é um GraphQLError customizado, retorna como está
					if (
						error instanceof Error &&
						error.constructor.name === "GraphQLError"
					) {
						return error;
					}

					// Em desenvolvimento, mostra mais detalhes
					if (isDev) {
						return new Error(
							`${message}: ${error instanceof Error ? error.message : String(error)}`,
						);
					}

					// Em produção, retorna mensagem genérica
					return new Error(message);
				},
				errorMessage: "An unexpected error occurred. Please try again later.",
			},
		}),
	)
	.options("*", handlePreflight())
	.get("/graphiql", ({ request }) => graphiqlAuthHandler(request))
	.get("/health", () => ({ status: "ok", cors: "enabled" }));
