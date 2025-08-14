import { z } from "zod";
import { ValidationError } from "../errors";

// Schema base para validação de tokens
export const TokenSchema = z.object({
	xAccessToken: z.string().min(1, "Access token is required"),
});

// Schema para validação de paginação
export const PaginationSchema = z.object({
	page: z.number().int().positive().optional().default(1),
	limit: z.number().int().positive().max(100).optional().default(20),
	offset: z.number().int().nonnegative().optional(),
});

// Schema para validação de filtros de busca
export const SearchFiltersSchema = z.object({
	query: z.string().min(1, "Search query is required").max(255, "Search query too long"),
	filters: z.record(z.string(), z.any()).optional(),
	sortBy: z.string().optional(),
	sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
});

// Schema para validação de IDs
export const IdSchema = z.object({
	id: z.string().min(1, "ID is required").max(100, "ID too long"),
});

// Schema para validação de UUIDs
export const UuidSchema = z.object({
	id: z.string().uuid("Invalid UUID format"),
});

// Função utilitária para validar input
export const validateInput = <T>(
	schema: z.ZodSchema<T>,
	input: unknown,
	context?: string
): T => {
	try {
		return schema.parse(input);
	} catch (error) {
		if (error instanceof z.ZodError) {
			// Acessa as propriedades do ZodError de forma segura
			const zodError = error as z.ZodError;
			const errors = (zodError as any).errors;
			if (errors && errors.length > 0) {
				const firstError = errors[0];
				const field = firstError.path && firstError.path.length > 0 
					? firstError.path.join(".") 
					: undefined;
				const errorMessage = firstError.message || "Invalid input data";
				throw new ValidationError(
					`${context ? `${context}: ` : ""}${errorMessage}`,
					field
				);
			}
		}
		// Fallback para outros tipos de erro
		throw new ValidationError(context ? `${context}: Invalid input data` : "Invalid input data");
	}
};

// Função para validação parcial (permite campos opcionais)
export const validatePartialInput = <T>(
	schema: z.ZodSchema<T>,
	input: unknown,
	context?: string
): Partial<T> => {
	try {
		return (schema as any).partial().parse(input);
	} catch (error) {
		if (error instanceof z.ZodError) {
			// Acessa as propriedades do ZodError de forma segura
			const zodError = error as any;
			if (zodError.errors && zodError.errors.length > 0) {
				const firstError = zodError.errors[0];
				const field = firstError.path && firstError.path.length > 0 
					? firstError.path.join(".") 
					: undefined;
				throw new ValidationError(
					`${context ? `${context}: ` : ""}${firstError.message}`,
					field
				);
			}
		}
		throw new ValidationError("Invalid input data");
	}
};

// Função para validação de headers
export const validateHeaders = (headers: Record<string, string>) => {
	const requiredHeaders = ["x-access-token"];
	const missingHeaders = requiredHeaders.filter(header => !headers[header]);
	
	if (missingHeaders.length > 0) {
		throw new ValidationError(
			`Missing required headers: ${missingHeaders.join(", ")}`,
			"headers"
		);
	}
	
	return headers;
};

// Função para validação de rate limiting
export const validateRateLimit = (
	identifier: string,
	maxRequests: number,
	windowMs: number,
	requestCounts: Map<string, { count: number; resetTime: number }>
): boolean => {
	const now = Date.now();
	const windowStart = now - windowMs;
	
	const userRequests = requestCounts.get(identifier);
	
	if (!userRequests || userRequests.resetTime < windowStart) {
		requestCounts.set(identifier, { count: 1, resetTime: now });
		return true;
	}
	
	if (userRequests.count >= maxRequests) {
		return false;
	}
	
	userRequests.count++;
	return true;
};
