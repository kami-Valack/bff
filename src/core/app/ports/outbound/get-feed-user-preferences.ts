export namespace IGetFeedUserPreferencesGateway {
	export type Input = {
		xAccessToken: string;
	};
	export type Output = {
		userSettings: {
			feedViewPreference: string;
			id: string;
			allowMentions?: boolean;
		};
	};
}

export interface IGetFeedUserPreferencesGateway {
	execute(
		input: IGetFeedUserPreferencesGateway.Input,
	): Promise<IGetFeedUserPreferencesGateway.Output>;
}
