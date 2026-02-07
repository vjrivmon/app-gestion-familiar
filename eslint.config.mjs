import nextConfig from "eslint-config-next";

export default [
  ...nextConfig,
  {
    rules: {
      // React Compiler rules - el proyecto no usa React Compiler
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
    },
  },
];
