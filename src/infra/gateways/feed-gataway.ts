import type { IGetFeedUserPreferencesGateway } from "../../core/app/ports/outbound/get-feed-user-preferences.ts";
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

export const GET_FEED_USER_PREFERENCES = `#graphql
  query GetFeedUserPreferences {
    userSettings {
      allowMentions
      feedViewPreference
    }
  }
`;

export class GetFeedUserPreferencesGateway
	implements IGetFeedUserPreferencesGateway
{
	async execute(
		input: IGetFeedUserPreferencesGateway.Input,
	): Promise<IGetFeedUserPreferencesGateway.Output> {
		try {
			const response = await feedApiMsGqlr<{
				data: IGetFeedUserPreferencesGateway.Output;
			}>(
				GET_FEED_USER_PREFERENCES,
				{},
				{
					"x-access-token": input.xAccessToken,
				},
			);

			return response.data.data;
		} catch (error) {
			console.log("==>=> ERROR", error);
			throw error;
		}
	}
}
