import { describe, it, expect, beforeEach } from "bun:test";
import { 
	ValidationError, 
	AuthenticationError, 
	NotFoundError,
	ServiceUnavailableError,
	GraphQLErrorHandler 
} from "../errors";
import { validateInput, IdSchema } from "../utils";

describe("Sistema de Tratamento de Erros GraphQL", () => {
	describe("Classes de Erro", () => {
		it("deve criar ValidationError com código correto", () => {
			const error = new ValidationError("Campo obrigatório", "email");
			
			expect(error.message).toBe("Campo obrigatório");
			expect(error.extensions?.code).toBe("VALIDATION_ERROR");
			expect(error.extensions?.http?.status).toBe(400);
			expect(error.extensions?.field).toBe("email");
		});

		it("deve criar AuthenticationError com código correto", () => {
			const error = new AuthenticationError("Token inválido");
			
			expect(error.message).toBe("Token inválido");
			expect(error.extensions?.code).toBe("UNAUTHORIZED");
			expect(error.extensions?.http?.status).toBe(401);
		});

		it("deve criar NotFoundError com contexto", () => {
			const error = new NotFoundError("User", "123");
			
			expect(error.message).toBe("User with identifier '123' not found");
			expect(error.extensions?.code).toBe("NOT_FOUND");
			expect(error.extensions?.http?.status).toBe(404);
			expect(error.extensions?.resource).toBe("User");
			expect(error.extensions?.identifier).toBe("123");
		});
	});

	describe("Validação com Zod", () => {
		it("deve validar input válido", () => {
			const input = { id: "valid-id" };
			const result = validateInput(IdSchema, input, "test");
			
			expect(result).toEqual(input);
		});

		it("deve lançar ValidationError para input inválido", () => {
			const input = { id: "" };
			
			expect(() => {
				validateInput(IdSchema, input, "test");
			}).toThrow(ValidationError);
		});

		it("deve incluir contexto no erro de validação", () => {
			const input = { id: "" };
			
			try {
				validateInput(IdSchema, input, "getUser");
			} catch (error) {
				expect(error).toBeInstanceOf(ValidationError);
				expect((error as ValidationError).message).toContain("getUser");
			}
		});
	});

	describe("GraphQLErrorHandler", () => {
		it("deve formatar erros customizados", () => {
			const customError = new ValidationError("Test error");
			const formatted = GraphQLErrorHandler.handleError(customError);
			
			expect(formatted).toBe(customError);
			expect(formatted.extensions?.code).toBe("VALIDATION_ERROR");
		});

		it("deve mapear erros de JWT para AuthenticationError", () => {
			const jwtError = new Error("jwt expired");
			const formatted = GraphQLErrorHandler.handleUnexpectedError(jwtError);
			
			expect(formatted.extensions?.code).toBe("UNAUTHORIZED");
			expect(formatted.message).toBe("Invalid or expired token");
		});

		it("deve mapear erros de permissão para AuthorizationError", () => {
			const permissionError = new Error("insufficient permissions");
			const formatted = GraphQLErrorHandler.handleUnexpectedError(permissionError);
			
			expect(formatted.extensions?.code).toBe("FORBIDDEN");
			expect(formatted.message).toBe("Insufficient permissions for this operation");
		});

		it("deve mapear erros de rate limit", () => {
			const rateLimitError = new Error("rate limit exceeded");
			const formatted = GraphQLErrorHandler.handleUnexpectedError(rateLimitError);
			
			expect(formatted.extensions?.code).toBe("RATE_LIMIT_EXCEEDED");
		});
	});

	describe("Cenários de Uso Real", () => {
		it("deve tratar erro de usuário não encontrado", async () => {
			const getUserById = async (id: string) => {
				if (id === "not-found") {
					throw new NotFoundError("User", id);
				}
				return { id, name: "John Doe" };
			};

			await expect(getUserById("not-found")).rejects.toThrow(NotFoundError);
		});

		it("deve validar e processar input de usuário", async () => {
			const createUser = async (input: any) => {
				// Validação com Zod
				const validated = validateInput(IdSchema, input, "createUser");
				
				// Simula criação
				return { id: validated.id, status: "created" };
			};

			const result = await createUser({ id: "new-user" });
			expect(result).toEqual({ id: "new-user", status: "created" });
		});

		it("deve tratar erros de serviço externo", async () => {
			const callExternalService = async () => {
				throw new Error("Service connection failed");
			};

			const safeCall = async () => {
				try {
					await callExternalService();
				} catch (error) {
					throw new ServiceUnavailableError("External service unavailable");
				}
			};

			await expect(safeCall()).rejects.toThrow(ServiceUnavailableError);
		});
	});

	describe("Logging e Monitoramento", () => {
		it("deve incluir timestamp nos erros", () => {
			const error = new ValidationError("Test");
			
			expect(error.extensions?.timestamp).toBeDefined();
			expect(new Date(error.extensions?.timestamp as string)).toBeInstanceOf(Date);
		});

		it("deve incluir código de erro estruturado", () => {
			const error = new AuthenticationError("Test");
			
			expect(error.extensions?.code).toBe("UNAUTHORIZED");
			expect(error.extensions?.http?.status).toBe(401);
		});
	});
});
