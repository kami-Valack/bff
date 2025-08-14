import type { AxiosInstance } from "axios";

type Props = {
	query: string;
	variables: Record<string, unknown>;
	api: AxiosInstance;
	headers?: Record<string, string>;
};

export const gqlr = async <Response = any>({
	api,
	query,
	variables,
	headers,
}: Props) => {
	return await api.post<Response>(
		"/",
		{
			query,
			variables,
		},
		{
			headers: {
				...headers,
			},
		},
	);
};
