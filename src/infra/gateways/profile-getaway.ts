import type { IGetProfileUserPreferencesGateway } from "../../core/app/ports/outbound/get-profile-user-preferences.ts";
import { profileApiMs } from "../utils/api.ts";
import { gqlr } from "../utils/gqlr.ts";

const profileApiMsGqlr = <Response = any>(
	query: string,
	variables: Record<string, unknown>,
	headers?: Record<string, string>,
) =>
	gqlr<Response>({
		api: profileApiMs,
		query,
		variables,
		headers,
	});

export const GET_PROFILE_USER_PREFERENCES = `#graphql
   query GetLoggedUser {
    user {
      userVisibilitySettings {
        profileViewMode
        profilePublic
        profilePictureScope
        followingVisibility
        notifyMentionsInMedia
        allowMentions
      }
    }
  }
`;

export class GetProfileUserPreferencesGateway
	implements IGetProfileUserPreferencesGateway
{
	async execute(
		input: IGetProfileUserPreferencesGateway.Input,
	): Promise<IGetProfileUserPreferencesGateway.Output> {
		const response = await profileApiMsGqlr<{
			data: IGetProfileUserPreferencesGateway.Output;
		}>(
			GET_PROFILE_USER_PREFERENCES,
			{},
			{
				"x-access-token": input.xAccessToken,
			},
		);

		return response.data.data;
	}
}
