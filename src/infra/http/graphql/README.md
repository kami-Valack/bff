# Sistema de Tratamento de Erros GraphQL

Este projeto implementa um sistema robusto e padronizado de tratamento de erros para GraphQL, incluindo validação de input, logging estruturado, rate limiting e middlewares de erro.

## 🏗️ Arquitetura

### Estrutura de Arquivos
```
src/infra/http/graphql/
├── errors/
│   ├── base-error.ts          # Classes base de erro
│   ├── error-handler.ts       # Manipulador centralizado de erros
│   └── index.ts               # Exportações
├── middleware/
│   ├── error-middleware.ts    # Middlewares de tratamento de erro
│   └── index.ts               # Exportações
├── utils/
│   ├── validation.ts          # Utilitários de validação com Zod
│   └── index.ts               # Exportações
├── resolver-utils.ts          # Utilitários para resolvers
├── graphql-setup.ts           # Configuração principal do GraphQL
└── README.md                  # Esta documentação
```

## 🚨 Classes de Erro

### BaseGraphQLError
Classe abstrata base para todos os erros customizados do GraphQL.

### Erros Específicos
- **ValidationError**: Erros de validação de input (400)
- **AuthenticationError**: Erros de autenticação (401)
- **AuthorizationError**: Erros de autorização (403)
- **NotFoundError**: Recursos não encontrados (404)
- **RateLimitError**: Rate limiting excedido (429)
- **InternalServerError**: Erros internos do servidor (500)
- **ServiceUnavailableError**: Serviço indisponível (503)
- **BadGatewayError**: Erro de gateway (502)

## 🔧 Como Usar

### 1. Criando um Resolver com Tratamento de Erro

```typescript
import { makeResolver } from "./resolver-utils";
import { ValidationError, NotFoundError } from "./errors";
import { validateInput, IdSchema } from "./utils";

const getUserById = async (args: any, context: ResolverContext) => {
	try {
		// Validação de input usando Zod
		const validatedArgs = validateInput(IdSchema, args, "getUserById");
		
		// Lógica do resolver
		const user = await userService.findById(validatedArgs.id);
		
		if (!user) {
			throw new NotFoundError("User", validatedArgs.id);
		}
		
		return user;
	} catch (error) {
		// Re-lança erros conhecidos
		if (error instanceof ValidationError || error instanceof NotFoundError) {
			throw error;
		}
		
		// Para outros erros, lança erro genérico
		throw new ServiceUnavailableError("Unable to retrieve user");
	}
};

export const userResolver = {
	Query: {
		user: makeResolver(getUserById, { 
			requireAuth: true, 
			validateInput: true 
		}),
	},
};
```

### 2. Validação de Input com Zod

```typescript
import { z } from "zod";
import { validateInput } from "./utils";

// Define o schema
const CreateUserSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Invalid email format"),
	age: z.number().int().positive().optional(),
});

// Valida o input
const createUser = async (args: any, context: ResolverContext) => {
	const validatedArgs = validateInput(CreateUserSchema, args, "createUser");
	
	// Use validatedArgs.name, validatedArgs.email, etc.
	// Todos os campos estão validados e tipados
};
```

### 3. Middlewares Automáticos

O sistema inclui middlewares automáticos para:

- **Tratamento de Erros**: Captura e formata todos os erros
- **Rate Limiting**: Limita requisições por IP (configurável)
- **Performance**: Monitora queries lentas (>1000ms)
- **Logging**: Log estruturado de erros e performance

### 4. Configuração de Rate Limiting

```typescript
// Em graphql-setup.ts
export const graphqlMiddlewares = [
	createErrorMiddleware(),
	createRateLimitMiddleware(100, 900000), // 100 requests por 15 minutos
	createPerformanceMiddleware(),
];
```

## 📊 Logging e Monitoramento

### Logs Estruturados
Todos os erros são logados com contexto estruturado:

```json
{
	"timestamp": "2024-01-15T10:30:00.000Z",
	"errorCode": "VALIDATION_ERROR",
	"message": "Invalid email format",
	"field": "email",
	"operationName": "createUser",
	"variables": { "email": "invalid-email" },
	"userAgent": "Mozilla/5.0...",
	"ip": "192.168.1.1"
}
```

### Monitoramento de Performance
- Queries lentas (>1000ms) são automaticamente logadas
- Métricas de tempo de execução
- Identificação de operações problemáticas

## 🛡️ Segurança

### Rate Limiting
- Proteção contra ataques de força bruta
- Configurável por IP e janela de tempo
- Headers de retry incluídos nas respostas

### Validação de Input
- Validação com Zod para todos os inputs
- Sanitização automática de dados
- Prevenção de injeção de código

### Autenticação
- Validação automática de tokens
- Contexto de usuário em todos os resolvers
- Headers de autorização obrigatórios

## 🔍 Debugging

### Modo Desenvolvimento
```typescript
// Logs detalhados em desenvolvimento
if (process.env.NODE_ENV === "development") {
	console.error("🚨 GraphQL Error:", JSON.stringify(logData, null, 2));
	console.error("Stack trace:", error.stack);
}
```

### Modo Produção
```typescript
// Logs limpos em produção
console.error(`[${timestamp}] ${errorCode}: ${message}`);
```

## 📝 Exemplos Completos

### Resolver com Validação Completa
```typescript
import { makeResolver } from "./resolver-utils";
import { ValidationError, NotFoundError } from "./errors";
import { validateInput, UuidSchema } from "./utils";

const updateUser = async (args: any, context: ResolverContext) => {
	try {
		// Validação de input
		const validatedArgs = validateInput(UuidSchema, args, "updateUser");
		
		// Validação de negócio
		if (!context.headers.xAccessToken) {
			throw new AuthenticationError("User not authenticated");
		}
		
		// Operação principal
		const user = await userService.update(validatedArgs.id, args);
		
		if (!user) {
			throw new NotFoundError("User", validatedArgs.id);
		}
		
		return user;
	} catch (error) {
		// Re-lança erros conhecidos
		if (error instanceof ValidationError || 
			error instanceof NotFoundError || 
			error instanceof AuthenticationError) {
			throw error;
		}
		
		// Log do erro inesperado
		console.error("Unexpected error in updateUser:", error);
		
		// Retorna erro genérico para o cliente
		throw new ServiceUnavailableError("Unable to update user");
	}
};

export const userResolver = {
	Mutation: {
		updateUser: makeResolver(updateUser, { 
			requireAuth: true, 
			validateInput: true 
		}),
	},
};
```

## 🚀 Próximos Passos

### Integrações Recomendadas
- **Sentry**: Para monitoramento de erros em produção
- **Winston/Pino**: Para logging avançado
- **Prometheus**: Para métricas de performance
- **Redis**: Para rate limiting distribuído

### Melhorias Futuras
- Circuit breaker para serviços externos
- Retry automático com backoff exponencial
- Cache de erros para debugging
- Dashboard de monitoramento de erros

## 📚 Referências

- [GraphQL Error Handling Best Practices](https://graphql.org/learn/best-practices/#error-handling)
- [Zod Documentation](https://zod.dev/)
- [Elysia GraphQL Yoga](https://elysiajs.com/plugins/graphql-yoga.html)
