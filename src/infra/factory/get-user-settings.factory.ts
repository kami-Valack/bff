import { GetUserSettingsUseCase } from "@/src/core/app/use-cases";
import { RedisCache } from "../db/redis";
import {
	GetFeedUserPreferencesGateway,
	GetProfileUserPreferencesGateway,
	GetThemeLanguageUserPreferencesGateway,
} from "../gateways";

export const makeGetUserSettingsUsecase = () => {
	const getFeedUserPreferencesGateway = new GetFeedUserPreferencesGateway();
	const getProfileUserPreferencesGateway =
		new GetProfileUserPreferencesGateway();
	const getUserthemelanguagePreferencesGateway =
		new GetThemeLanguageUserPreferencesGateway();
	const cache = new RedisCache();

	return new GetUserSettingsUseCase(
		getFeedUserPreferencesGateway,
		getProfileUserPreferencesGateway,
		getUserthemelanguagePreferencesGateway,
		cache,
	);
};
