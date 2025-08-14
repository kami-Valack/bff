import { GraphQLError } from "graphql";
import { 
	AuthenticationError, 
	GraphQLErrorHandler,
	ValidationError,
	InternalServerError
} from "./errors";

export interface AuthContext {
	xAccessToken: string | null;
}

export interface ResolverContext {
	headers: {
		xAccessToken: string;
	};
}

export interface ResolverOptions {
	requireAuth: boolean;
	validateInput?: boolean;
}

export type ResolverFunction<TArgs = any, TResult = any> = (
	args: TArgs,
	context: ResolverContext,
) => Promise<TResult>;

export const makeResolver = <TArgs = any, TResult = any>(
	resolverFn: ResolverFunction<TArgs, TResult>,
	options: ResolverOptions = { requireAuth: true, validateInput: false },
) => {
	return async (
		_: any,
		args: TArgs,
		context: AuthContext,
	): Promise<TResult> => {
		try {
			// Validação de autenticação (obrigatória por padrão)
			if (options.requireAuth && !context.xAccessToken) {
				throw new AuthenticationError("Authentication token is required");
			}

			// Validação básica de input
			if (options.validateInput && (!args || Object.keys(args).length === 0)) {
				throw new ValidationError("Invalid input parameters");
			}

			const props: ResolverContext = {
				headers: {
					xAccessToken: context.xAccessToken || "",
				},
			};

			return await resolverFn(args, props);
		} catch (error) {
			// Se já é um GraphQLError, re-lança
			if (error instanceof GraphQLError) {
				throw error;
			}

			// Para outros tipos de erro, converte para GraphQLError
			throw GraphQLErrorHandler.handleUnexpectedError(error, {
				operationName: "resolver",
				variables: args,
			});
		}
	};
};

// Wrapper para resolvers que precisam de tratamento de erro específico
export const withErrorHandling = <TArgs = any, TResult = any>(
	resolverFn: ResolverFunction<TArgs, TResult>,
	errorContext?: Record<string, any>
) => {
	return async (parent: any, args: TArgs, context: ResolverContext): Promise<TResult> => {
		try {
			return await resolverFn(args, context);
		} catch (error) {
			if (error instanceof GraphQLError) {
				throw GraphQLErrorHandler.handleError(error, {
					...errorContext,
					variables: args,
				});
			}

			throw GraphQLErrorHandler.handleUnexpectedError(error, {
				...errorContext,
				variables: args,
			});
		}
	};
};
