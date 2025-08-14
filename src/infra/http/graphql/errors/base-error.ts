import { GraphQLError } from "graphql";

export abstract class BaseGraphQLError extends GraphQLError {
	constructor(
		message: string,
		code: string,
		statusCode: number = 500,
		extensions?: Record<string, any>
	) {
		super(message, {
			extensions: {
				code,
				http: { status: statusCode },
				timestamp: new Date().toISOString(),
				...extensions,
			},
		});
	}
}

export class ValidationError extends BaseGraphQLError {
	constructor(message: string, field?: string) {
		super(
			message,
			"VALIDATION_ERROR",
			400,
			field ? { field } : undefined
		);
	}
}

export class AuthenticationError extends BaseGraphQLError {
	constructor(message: string = "Authentication required") {
		super(message, "UNAUTHORIZED", 401);
	}
}

export class AuthorizationError extends BaseGraphQLError {
	constructor(message: string = "Insufficient permissions") {
		super(message, "FORBIDDEN", 403);
	}
}

export class NotFoundError extends BaseGraphQLError {
	constructor(resource: string, identifier?: string) {
		const message = identifier 
			? `${resource} with identifier '${identifier}' not found`
			: `${resource} not found`;
		super(message, "NOT_FOUND", 404, { resource, identifier });
	}
}

export class RateLimitError extends BaseGraphQLError {
	constructor(message: string = "Rate limit exceeded") {
		super(message, "RATE_LIMIT_EXCEEDED", 429);
	}
}

export class InternalServerError extends BaseGraphQLError {
	constructor(message: string = "Internal server error") {
		super(message, "INTERNAL_SERVER_ERROR", 500);
	}
}

export class ServiceUnavailableError extends BaseGraphQLError {
	constructor(message: string = "Service temporarily unavailable") {
		super(message, "SERVICE_UNAVAILABLE", 503);
	}
}

export class BadGatewayError extends BaseGraphQLError {
	constructor(message: string = "Bad gateway") {
		super(message, "BAD_GATEWAY", 502);
	}
}
