export namespace IGetProfileUserPreferencesGateway {
	export type Input = {
		xAccessToken: string;
	};

	export type Output = {
		user: {
			userVisibilitySettings: {
				profileViewMode: string;
				profilePublic: boolean;
				profilePictureScope: string;
				followingVisibility: string;
				notifyMentionsInMedia: boolean;
				allowMentions: boolean;
			};
		};
	};
}

export interface IGetProfileUserPreferencesGateway {
	execute(
		input: IGetProfileUserPreferencesGateway.Input,
	): Promise<IGetProfileUserPreferencesGateway.Output>;
}
