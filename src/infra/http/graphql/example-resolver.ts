import { makeResolver, withErrorHandling, type ResolverContext } from "./resolver-utils";
import { 
	ValidationError, 
	NotFoundError, 
	ServiceUnavailableError,
	RateLimitError 
} from "./errors";
import { validateInput, TokenSchema, IdSchema } from "./utils";

// Exemplo de resolver com validação de input
const getUserById = async (args: any, context: ResolverContext) => {
	try {
		// Validação de input usando Zod
		const validatedArgs = validateInput(IdSchema, args, "getUserById");
		
		// Simula uma operação que pode falhar
		if (validatedArgs.id === "invalid-id") {
			throw new ValidationError("Invalid user ID format");
		}
		
		if (validatedArgs.id === "not-found") {
			throw new NotFoundError("User", validatedArgs.id);
		}
		
		if (validatedArgs.id === "rate-limited") {
			throw new RateLimitError("Too many requests for this user");
		}
		
		// Simula sucesso
		return {
			id: validatedArgs.id,
			name: "John Doe",
			email: "john@example.com",
			createdAt: new Date().toISOString(),
		};
	} catch (error) {
		// Re-lança erros conhecidos
		if (error instanceof ValidationError || 
			error instanceof NotFoundError || 
			error instanceof RateLimitError) {
			throw error;
		}
		
		// Para outros erros, lança erro genérico
		throw new ServiceUnavailableError("Unable to retrieve user information");
		}
};

// Exemplo de resolver com validação de autenticação
const updateUserProfile = async (args: any, context: ResolverContext) => {
	try {
		// Validação de input
		if (!args || !args.name || !args.email) {
			throw new ValidationError("Name and email are required");
		}
		
		// Validação de email básica
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(args.email)) {
			throw new ValidationError("Invalid email format", "email");
		}
		
		// Simula atualização
		return {
			success: true,
			message: "Profile updated successfully",
			updatedAt: new Date().toISOString(),
		};
	} catch (error) {
		if (error instanceof ValidationError) {
			throw error;
		}
		
		throw new ServiceUnavailableError("Unable to update profile");
	}
};

// Exemplo de resolver com rate limiting customizado
const searchUsers = async (args: any, context: ResolverContext) => {
	try {
		// Validação de input
		if (!args.query || args.query.length < 2) {
			throw new ValidationError("Search query must be at least 2 characters long", "query");
		}
		
		// Simula busca
		return {
			users: [
				{ id: "1", name: "John Doe", email: "john@example.com" },
				{ id: "2", name: "Jane Smith", email: "jane@example.com" },
			],
			total: 2,
			query: args.query,
		};
	} catch (error) {
		if (error instanceof ValidationError) {
			throw error;
		}
		
		throw new ServiceUnavailableError("Search service unavailable");
	}
};

export const exampleResolver = {
	Query: {
		// Resolver com tratamento de erro básico
		user: makeResolver(getUserById, { requireAuth: true, validateInput: true }),
		
		// Resolver com validação de input
		searchUsers: makeResolver(searchUsers, { requireAuth: false, validateInput: true }),
	},
	
	Mutation: {
		// Resolver para mutações
		updateProfile: makeResolver(updateUserProfile, { requireAuth: true, validateInput: true }),
	},
};
