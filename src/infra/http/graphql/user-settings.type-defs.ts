export const userSettingsTypeDefs = `#graphql
  type FeedSettings {
    allowMentions: Boolean!
    feedViewPreference: String!
  }

  type ProfileSettings {
    profileViewMode: String
    profilePublic: Boolean
    profilePictureScope: String
    followingVisibility: String
    notifyMentionsInMedia: Boolean
    allowMentions: Boolean
  }

  type ThemeLanguageSettings {
    preferredLanguage: String
  }

  type UserSettings {
    feed: FeedSettings
    profile: ProfileSettings
    themeLanguage: ThemeLanguageSettings
  }

  type Query {
    userSettings: UserSettings!
  }
`;
