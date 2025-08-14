import axios from "axios";

export const feedApiMs = axios.create({
	baseURL: "https://vps.mirantes.io/feed/graphql",
});

export const profileApiMs = axios.create({
	baseURL: "https://vps.mirantes.io/profile/graphql",
});
