import { GraphQLError } from "graphql";
import { 
	BaseGraphQLError, 
	InternalServerError, 
	ValidationError,
	AuthenticationError,
	AuthorizationError,
	NotFoundError,
	RateLimitError,
	ServiceUnavailableError,
	BadGatewayError
} from "./base-error";

export interface ErrorLogData {
	timestamp: string;
	errorCode: string;
	message: string;
	path?: string;
	operationName?: string;
	variables?: any;
	userAgent?: string;
	ip?: string;
	userId?: string;
	stack?: string;
	extensions?: Record<string, any>;
}

export class GraphQLErrorHandler {
	private static formatError(error: GraphQLError): GraphQLError {
		// Se já é um erro customizado, retorna como está
		if (error instanceof BaseGraphQLError) {
			return error;
		}

		// Mapeia erros comuns para nossos tipos customizados
		if (error.message.toLowerCase().includes("jwt") || error.message.toLowerCase().includes("token")) {
			return new AuthenticationError("Invalid or expired token");
		}

		if (error.message.toLowerCase().includes("permission") || error.message.toLowerCase().includes("access")) {
			return new AuthorizationError("Insufficient permissions for this operation");
		}

		if (error.message.toLowerCase().includes("not found") || error.message.toLowerCase().includes("does not exist")) {
			return new NotFoundError("Resource", undefined);
		}

		if (error.message.toLowerCase().includes("validation") || error.message.toLowerCase().includes("invalid")) {
			return new ValidationError(error.message);
		}

		if (error.message.toLowerCase().includes("rate limit") || error.message.toLowerCase().includes("too many requests")) {
			return new RateLimitError();
		}

		if (error.message.toLowerCase().includes("service unavailable") || error.message.toLowerCase().includes("maintenance")) {
			return new ServiceUnavailableError();
		}

		if (error.message.toLowerCase().includes("bad gateway") || error.message.toLowerCase().includes("upstream")) {
			return new BadGatewayError();
		}

		// Para erros desconhecidos, retorna erro interno genérico
		return new InternalServerError("An unexpected error occurred");
	}

	private static logError(error: GraphQLError, context?: any): void {
		const logData: ErrorLogData = {
			timestamp: new Date().toISOString(),
			errorCode: (error.extensions?.code as string) || "UNKNOWN_ERROR",
			message: error.message,
			path: context?.path,
			operationName: context?.operationName,
			variables: context?.variables,
			userAgent: context?.headers?.["user-agent"],
			ip: context?.ip,
			userId: context?.userId,
			stack: error.extensions?.stack as string | undefined,
			extensions: error.extensions,
		};

		// Log estruturado para diferentes ambientes
		if (process.env.NODE_ENV === "development") {
			console.error("🚨 GraphQL Error:", JSON.stringify(logData, null, 2));
			if (error.stack) {
				console.error("Stack trace:", error.stack);
			}
		} else {
			// Em produção, log mais limpo
			console.error(`[${logData.timestamp}] ${logData.errorCode}: ${logData.message}`);
		}

		// Aqui você pode adicionar integração com serviços de logging como:
		// - Sentry
		// - LogRocket
		// - Winston
		// - Pino
	}

	static handleError(error: GraphQLError, context?: any): GraphQLError {
		const formattedError = this.formatError(error);
		this.logError(formattedError, context);
		return formattedError;
	}

	static handleUnexpectedError(error: unknown, context?: any): GraphQLError {
		let graphQLError: GraphQLError;

		if (error instanceof GraphQLError) {
			graphQLError = error;
		} else if (error instanceof Error) {
			// Mapeia erros específicos baseados na mensagem
			const message = error.message.toLowerCase();
			
			if (message.includes("jwt") || message.includes("token")) {
				graphQLError = new AuthenticationError("Invalid or expired token");
			} else if (message.includes("permission") || message.includes("access") || message.includes("insufficient")) {
				graphQLError = new AuthorizationError("Insufficient permissions for this operation");
			} else if (message.includes("rate limit") || message.includes("too many requests")) {
				graphQLError = new RateLimitError();
			} else if (message.includes("not found") || message.includes("does not exist")) {
				graphQLError = new NotFoundError("Resource", undefined);
			} else if (message.includes("validation") || message.includes("invalid")) {
				graphQLError = new ValidationError(error.message);
			} else if (message.includes("service unavailable") || message.includes("maintenance")) {
				graphQLError = new ServiceUnavailableError();
			} else if (message.includes("bad gateway") || message.includes("upstream")) {
				graphQLError = new BadGatewayError();
			} else {
				graphQLError = new InternalServerError(error.message);
			}
		} else {
			graphQLError = new InternalServerError("An unexpected error occurred");
		}

		return this.handleError(graphQLError, context);
	}
}
