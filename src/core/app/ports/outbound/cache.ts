type CacheHourMinuteValues = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
type CacheSecondValues = 5 | 6 | 7 | 8 | 9 | 10;
export type CacheTTL =
	| `${CacheHourMinuteValues}h`
	| `${CacheHourMinuteValues}m`
	| `${CacheSecondValues}s`;

export interface Cache {
	save(params: { key: string; value: unknown; ttl: CacheTTL }): Promise<void>;
	get(key: string): Promise<unknown>;
}
