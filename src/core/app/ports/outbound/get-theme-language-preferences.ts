export namespace IGetUserthemelanguagePreferencesGateway {
	export type Input = {
		xAccessToken: string;
	};
	export type Output = {
		languagePreference: {
			preferredLanguage?: string;
		};
	};
}

export interface IGetUserthemelanguagePreferencesGateway {
	execute(
		input: IGetUserthemelanguagePreferencesGateway.Input,
	): Promise<IGetUserthemelanguagePreferencesGateway.Output>;
}
