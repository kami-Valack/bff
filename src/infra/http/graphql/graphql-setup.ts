import { mergeTypeDefs } from "@graphql-tools/merge";
import { print } from "graphql";
import { userSettingsResolver } from "./user-settings.resolver";
import { userSettingsTypeDefs } from "./user-settings.type-defs";
import { 
	createErrorMiddleware, 
	createRateLimitMiddleware, 
	createPerformanceMiddleware 
} from "./middleware";

export const appTypeDefs = print(mergeTypeDefs([userSettingsTypeDefs]));

export const appResolvers = {
	Query: {
		...userSettingsResolver.Query,
	},
};

// Middlewares para tratamento de erro e performance
export const graphqlMiddlewares = [
	createErrorMiddleware(),
	createRateLimitMiddleware(100, 900000), // 100 requests por 15 minutos
	createPerformanceMiddleware(),
];
