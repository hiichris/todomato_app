module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ["react-native-reanimated/plugin"],
  };
};
// Previous preset that breaks the app:
// presets: ["module:metro-react-native-babel-preset"],
