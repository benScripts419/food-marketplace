const expoConfig = require("./app.json").expo;
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

module.exports = {
  ...expoConfig,
  android: {
    ...expoConfig.android,
    ...(googleMapsApiKey
      ? {
          config: {
            ...expoConfig.android.config,
            googleMaps: {
              ...expoConfig.android.config?.googleMaps,
              apiKey: googleMapsApiKey,
            },
          },
        }
      : {}),
  },
  plugins: [
    ...expoConfig.plugins,
    [
      "expo-location",
      {
        locationWhenInUsePermission:
          "Allow AkroBite to use your location to set delivery addresses and share rider location during an active delivery.",
      },
    ],
  ],
  extra: {
    ...expoConfig.extra,
    googleMapsApiKeyConfigured: Boolean(googleMapsApiKey),
  },
};
