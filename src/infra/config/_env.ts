import { z } from "zod";

export const envSchema = z.object({
	// SERVER SETTINGS
	PORT: z.coerce.number().default(3333),

	// CORS
	CORS_ALLOWED_ORIGINS: z.string(),

	// SWAGGER
	SWAGGER_DOCS_USERNAME: z.string(),
	SWAGGER_DOCS_PASSWORD: z.string(),
});

const _envSchema = envSchema.safeParse(process.env);

if (_envSchema.success === false) {
	console.error("Invalid environment variables", _envSchema.error.format());
	throw new Error("Invalid environment variables");
}

export const _env = _envSchema.data;
