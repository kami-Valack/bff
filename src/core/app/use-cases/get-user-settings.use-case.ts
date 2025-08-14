import type { GetUserSettings } from "../ports/inbound/get-user-settings";
import type { Cache } from "../ports/outbound/cache";
import type { IGetFeedUserPreferencesGateway } from "../ports/outbound/get-feed-user-preferences";
import type { IGetProfileUserPreferencesGateway } from "../ports/outbound/get-profile-user-preferences";
import type { IGetUserthemelanguagePreferencesGateway } from "../ports/outbound/get-theme-language-preferences";

export class GetUserSettingsUseCase {
	constructor(
		private readonly getFeedUserPreferencesGateway: IGetFeedUserPreferencesGateway,
		private readonly getProfileUserPreferencesGateway: IGetProfileUserPreferencesGateway,
		private readonly getUserthemelanguagePreferencesGateway: IGetUserthemelanguagePreferencesGateway,
		private readonly cache: Cache,
	) {}

	async execute(input: GetUserSettings.Input): Promise<GetUserSettings.Output> {
		const cachedData = await this.cache.get(this.getKey(input.xAccessToken));

		if (cachedData) {
			return cachedData as GetUserSettings.Output;
		}

		const [feedResult, profileResult, themeLanguageResult] = await Promise.all([
			this.getFeedUserPreferencesGateway.execute(input),
			this.getProfileUserPreferencesGateway.execute(input),
			this.getUserthemelanguagePreferencesGateway.execute(input),
		]);

		const consolidatedData = {
			feed: {
				allowMentions: feedResult.userSettings?.allowMentions || false,
				feedViewPreference:
					feedResult.userSettings?.feedViewPreference || "DEFAULT",
			},
			profile: {
				profileViewMode:
					profileResult.user?.userVisibilitySettings?.profileViewMode,
				profilePublic:
					profileResult.user?.userVisibilitySettings?.profilePublic,
				profilePictureScope:
					profileResult.user?.userVisibilitySettings?.profilePictureScope,
				followingVisibility:
					profileResult.user?.userVisibilitySettings?.followingVisibility,
				notifyMentionsInMedia:
					profileResult.user?.userVisibilitySettings?.notifyMentionsInMedia,
				allowMentions:
					profileResult.user?.userVisibilitySettings?.allowMentions,
			},
			themeLanguage: {
				preferredLanguage:
					themeLanguageResult?.languagePreference?.preferredLanguage,
			},
		};

		await this.cache.save({
			key: this.getKey(input.xAccessToken),
			value: consolidatedData,
			ttl: "5s",
		});

		return consolidatedData;
	}

	private getKey(token: string) {
		return `user-settings:${token}`;
	}
}
