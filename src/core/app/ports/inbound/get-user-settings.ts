export namespace GetUserSettings {
	export type Input = {
		xAccessToken: string;
	};

	export type Output = {
		feed: {
			allowMentions: boolean;
			feedViewPreference: string;
		};
		profile: {
			profileViewMode?: string;
			profilePublic?: boolean;
			profilePictureScope?: string;
			followingVisibility?: string;
			notifyMentionsInMedia?: boolean;
			allowMentions?: boolean;
		};
		themeLanguage: {
			preferredLanguage?: string;
		};
	};
}
