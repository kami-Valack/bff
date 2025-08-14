import { GraphQLError } from "graphql";
import { GraphQLErrorHandler } from "../errors";

export interface ErrorMiddlewareContext {
	request: {
		headers: Record<string, string>;
		ip?: string;
		userAgent?: string;
	};
	operationName?: string;
	variables?: any;
	path?: string;
}

export const createErrorMiddleware = () => {
	return {
		onValidate: ({ params }: any) => {
			// Validação de parâmetros antes da execução
			if (params?.variables && typeof params.variables === "object") {
				// Aqui você pode adicionar validação de schema com Zod ou Joi
				// Por exemplo, validar se variáveis obrigatórias estão presentes
			}
		},

		onExecute: ({ params }: any) => {
			// Hook antes da execução da query/mutation
			// Verifica se params e contextValue existem antes de acessá-los
			if (!params?.contextValue) {
				return; // Sai silenciosamente se não houver contexto
			}

			const context: ErrorMiddlewareContext = {
				request: {
					headers: params.contextValue.headers || {},
					ip: params.contextValue.ip,
					userAgent: params.contextValue.headers?.["user-agent"],
				},
				operationName: params.operationName,
				variables: params.variables,
				path: params.contextValue.path,
			};

			// Armazena contexto para uso posterior
			params.contextValue.errorContext = context;
		},

		onError: ({ error, context }: any) => {
			// Tratamento centralizado de erros
			const errorContext = context?.errorContext || {};
			
			// Aplica tratamento de erro customizado
			const formattedError = GraphQLErrorHandler.handleError(error, errorContext);
			
			// Retorna o erro formatado
			return formattedError;
		},
	};
};

// Middleware para rate limiting
export const createRateLimitMiddleware = (maxRequests: number = 100, windowMs: number = 900000) => {
	const requestCounts = new Map<string, { count: number; resetTime: number }>();

	return {
		onExecute: ({ params }: any) => {
			// Verifica se params e contextValue existem
			if (!params?.contextValue) {
				return; // Sai silenciosamente se não houver contexto
			}

			const ip = params.contextValue.ip || "unknown";
			const now = Date.now();
			const windowStart = now - windowMs;

			const userRequests = requestCounts.get(ip);
			
			if (!userRequests || userRequests.resetTime < windowStart) {
				// Reset do contador para nova janela
				requestCounts.set(ip, { count: 1, resetTime: now });
			} else if (userRequests.count >= maxRequests) {
				// Rate limit excedido
				throw new GraphQLError("Rate limit exceeded", {
					extensions: {
						code: "RATE_LIMIT_EXCEEDED",
						http: { status: 429 },
						retryAfter: Math.ceil((userRequests.resetTime + windowMs - now) / 1000),
					},
				});
			} else {
				// Incrementa contador
				userRequests.count++;
			}
		},
	};
};

// Middleware para logging de performance
export const createPerformanceMiddleware = () => {
	return {
		onExecute: ({ params }: any) => {
			// Verifica se params e contextValue existem
			if (!params?.contextValue) {
				return; // Sai silenciosamente se não houver contexto
			}

			const startTime = Date.now();
			
			// Armazena tempo de início no contexto
			params.contextValue.executionStartTime = startTime;
		},

		onExecuteDone: ({ result, context }: any) => {
			const executionTime = Date.now() - (context?.executionStartTime || 0);
			
			// Log de performance para queries lentas (> 1000ms)
			if (executionTime > 1000) {
				console.warn(`🐌 Slow GraphQL query: ${executionTime}ms`, {
					operationName: context?.operationName,
					executionTime,
					timestamp: new Date().toISOString(),
				});
			}
		},
	};
};
