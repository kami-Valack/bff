import type { IGetUserthemelanguagePreferencesGateway } from "../../core/app/ports/outbound/get-theme-language-preferences";
import { feedApiMs } from "../utils/api.ts";
import { gqlr } from "../utils/gqlr.ts";

const feedApiMsGqlr = <Response = any>(
	query: string,
	variables: Record<string, unknown>,
	headers?: Record<string, string>,
) =>
	gqlr<Response>({
		api: feedApiMs,
		query,
		variables,
		headers,
	});

export const GET_THEME_LANGUAGE_USER_PREFERENCES = `#graphql
  query GET_LANGUAGE_CONTENT {
    languagePreference {
      systemLanguage
      preferredLanguage
    }
  }
`;

export class GetThemeLanguageUserPreferencesGateway
	implements IGetUserthemelanguagePreferencesGateway
{
	async execute(
		input: IGetUserthemelanguagePreferencesGateway.Input,
	): Promise<IGetUserthemelanguagePreferencesGateway.Output> {
		const response = await feedApiMsGqlr<{
			data: IGetUserthemelanguagePreferencesGateway.Output;
		}>(
			GET_THEME_LANGUAGE_USER_PREFERENCES,
			{},
			{
				"x-access-token": input.xAccessToken,
			},
		);

		return response.data.data;
	}
}
