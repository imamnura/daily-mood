const path = require("path");

// `expo-modules-core` dipasang npm di bawah `node_modules/expo/node_modules`
// (tidak di-hoist), sedangkan preset jest-expo me-require-nya dari root.
// Resolve dari paket `expo` supaya semua modul memakai instance yang sama,
// dan tetap benar jika suatu saat npm meng-hoist paket ini.
const expoModulesCoreDir = path.dirname(
  require.resolve("expo-modules-core/package.json", {
    paths: [path.dirname(require.resolve("expo/package.json"))],
  }),
);

/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  globalSetup: "<rootDir>/test/globalSetup.js",
  setupFiles: ["<rootDir>/test/setup.js"],
  moduleNameMapper: {
    "^expo-modules-core$": expoModulesCoreDir,
    "^expo-modules-core/(.*)$": `${expoModulesCoreDir}/$1`,
  },
  collectCoverageFrom: [
    "constants/**/*.js",
    "utils/**/*.js",
    "context/**/*.{js,jsx}",
    "components/**/*.{js,jsx}",
    "screens/**/*.{js,jsx}",
    "!**/__tests__/**",
  ],
};
