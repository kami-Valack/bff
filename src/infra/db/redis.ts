import Redis from "ioredis";
import type { Cache, CacheTTL } from "@/src/core/app/ports/outbound/cache";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

export class RedisCache implements Cache {
	async save(params: {
		key: string;
		value: unknown;
		ttl: CacheTTL;
	}): Promise<void> {
		try {
			const { key, value, ttl } = params;
			const stringValue = JSON.stringify(value);
			const ttlSeconds = this.parseTTL(ttl);
			await redis.set(key, stringValue, "EX", ttlSeconds);
		} catch (error) {
			console.error("Erro ao salvar no Redis:", error);
			// Não falha a aplicação se o Redis estiver indisponível
		}
	}

	async get(key: string): Promise<unknown> {
		try {
			const value = await redis.get(key);
			if (!value) return null;
			return JSON.parse(value);
		} catch (error) {
			console.error("Erro ao buscar no Redis:", error);
			return null;
		}
	}

	private parseTTL(ttl: CacheTTL): number {
		if (ttl.endsWith("h")) {
			return parseInt(ttl) * 3600;
		}
		if (ttl.endsWith("m")) {
			return parseInt(ttl) * 60;
		}
		if (ttl.endsWith("s")) {
			return parseInt(ttl);
		}
		return 3600;
	}
}
