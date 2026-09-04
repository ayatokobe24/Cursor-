import type { Config } from "tailwindcss";
import {
  colorTokens,
  fontTokens,
  spacingTokens,
} from "./styles/design-tokens";

const fontSize = Object.fromEntries(
  Object.entries(fontTokens).map(([name, token]) => [
    name,
    [
      token.fontSize,
      {
        lineHeight: token.lineHeight,
        fontWeight: String(token.fontWeight),
      },
    ],
  ]),
);

const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: colorTokens,
      fontSize,
      spacing: spacingTokens,
    },
  },
} satisfies Config;

export default config;
