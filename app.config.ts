import { ConfigContext, ExpoConfig } from "expo/config";

/**
 * Get the environment from EXPO_PUBLIC_ENV.
 * This is set via dotenv-cli when running different npm scripts.
 */
const ENV = process.env.EXPO_PUBLIC_ENV || 'development';
const IS_DEV = ENV === 'development' || ENV === 'debug';
const IS_STAGING = ENV === 'staging';
const IS_DEBUG = ENV === 'debug';
const IS_PROD = ENV === 'production';

/**
 * Get app name based on environment.
 */
function getAppName(): string {
  if (IS_DEBUG) return 'Lupa (Debug)';
  if (IS_DEV) return 'Lupa (Dev)';
  if (IS_STAGING) return 'Lupa (Staging)';
  return 'Lupa';
}

/**
 * Get bundle identifier based on environment.
 */
function getBundleIdentifier(): string {
  const base = 'com.lupa.app';
  if (IS_DEBUG) return `${base}.debug`;
  if (IS_DEV) return `${base}.dev`;
  if (IS_STAGING) return `${base}.staging`;
  return base;
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: getAppName(),
  slug: "lupa-app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "lupaapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: getBundleIdentifier(),
  },
  android: {
    package: getBundleIdentifier(),
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    // Environment metadata (accessible via expo-constants)
    environment: ENV,
    isDevelopment: IS_DEV,
    isStaging: IS_STAGING,
    isProduction: IS_PROD,
    isDebug: IS_DEBUG,
  },
});
