import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        mint: "#06b6d4",
        sand: "#f8fafc",
        sunrise: "#f59e0b",
      },
      boxShadow: {
        card: "0 16px 40px -24px rgba(15, 23, 42, 0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
