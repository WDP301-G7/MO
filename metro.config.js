const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Disable package exports field resolution to avoid warnings from packages like
// three.js whose exports wildcards point to paths without file extensions.
// Metro falls back to file-based resolution anyway, so this has no functional impact.
config.resolver.unstable_enablePackageExports = false;

// Redirect axios to its browser-safe build because axios's `main` field points
// to the Node.js build which imports Node built-ins (crypto, http, url, etc.)
// that are not available in the React Native runtime.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "axios") {
    return {
      filePath: require.resolve("axios/dist/browser/axios.cjs"),
      type: "sourceFile",
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
