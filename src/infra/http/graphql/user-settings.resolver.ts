import { makeGetUserSettingsUsecase } from "../../factory";
import { makeResolver, type ResolverContext } from "./resolver-utils";
import { NotFoundError, ServiceUnavailableError, ValidationError, AuthenticationError } from "./errors";

const getUserSettings = async (args: any, context: ResolverContext) => {
	try {
		// Validação de token (mesmo sendo obrigatório no makeResolver, validação adicional)
		if (!context.headers.xAccessToken || context.headers.xAccessToken.trim() === "") {
			throw new AuthenticationError("Token de acesso é obrigatório e não pode estar vazio");
		}

		// Validação de formato do token (deve ser um JWT válido)
		if (!context.headers.xAccessToken.includes(".") || context.headers.xAccessToken.split(".").length !== 3) {
			throw new ValidationError("Formato de token inválido. Deve ser um JWT válido", "xAccessToken");
		}

		// Validação de argumentos se houver
		if (args && Object.keys(args).length > 0) {
			// Exemplo: se houver um campo 'userId' nos argumentos
			if (args.userId && typeof args.userId !== "string") {
				throw new ValidationError("ID do usuário deve ser uma string", "userId");
			}
			
			if (args.userId && args.userId.length < 10) {
				throw new ValidationError("ID do usuário deve ter pelo menos 10 caracteres", "userId");
			}
		}

		const usecase = makeGetUserSettingsUsecase();
		
		// Executa o usecase
		const result = await usecase.execute({ xAccessToken: context.headers.xAccessToken });
		
		// Validação do resultado
		if (!result) {
			throw new NotFoundError("Configurações do usuário", "user preferences");
		}

		// Validação mais específica dos dados retornados
		if (!result.feed && !result.profile && !result.themeLanguage) {
			throw new NotFoundError("Nenhuma configuração encontrada para este usuário", "user settings");
		}

		// Validação específica das configurações de feed
		if (result.feed) {
			if (typeof result.feed.allowMentions !== "boolean") {
				throw new ValidationError("Configuração de menções deve ser um valor booleano", "feed.allowMentions");
			}
			
			if (!result.feed.feedViewPreference || result.feed.feedViewPreference.trim() === "") {
				throw new ValidationError("Preferência de visualização do feed é obrigatória", "feed.feedViewPreference");
			}
		}

		// Validação específica das configurações de perfil
		if (result.profile) {
			if (result.profile.profilePublic !== undefined && typeof result.profile.profilePublic !== "boolean") {
				throw new ValidationError("Configuração de perfil público deve ser um valor booleano", "profile.profilePublic");
			}
		}

		return result;
		
	} catch (error) {
		// Se já é um erro customizado, re-lança
		if (error instanceof NotFoundError || 
			error instanceof ServiceUnavailableError || 
			error instanceof ValidationError ||
			error instanceof AuthenticationError) {
			throw error;
		}
		
		// Para outros erros, loga e retorna erro genérico
		console.error("Erro inesperado ao buscar configurações do usuário:", {
			error: error instanceof Error ? error.message : String(error),
			timestamp: new Date().toISOString(),
			context: {
				hasToken: !!context.headers.xAccessToken,
				tokenLength: context.headers.xAccessToken?.length || 0,
				args: args
			}
		});
		
		throw new ServiceUnavailableError("Erro interno ao buscar configurações do usuário. Tente novamente em alguns instantes.");
	}
};

export const userSettingsResolver = {
	Query: {
		userSettings: makeResolver(getUserSettings, { requireAuth: true, validateInput: false }),
	},
};
