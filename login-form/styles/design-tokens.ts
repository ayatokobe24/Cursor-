export const colorTokens = {
  primary: "#3B82F6",
  secondary: "#6B7280",
  destructive: "#EF4444",
  success: "#10B981",
  background: "#FFFFFF",
  foreground: "#1F2937",
  muted: "#6B7280",
  border: "#E5E7EB",
} as const;

export type ColorTokenName = keyof typeof colorTokens;
export type ColorTokenValue = (typeof colorTokens)[ColorTokenName];

export const fontWeightTokens = {
  regular: 400,
  semibold: 600,
  bold: 700,
} as const;

export type FontWeightTokenName = keyof typeof fontWeightTokens;
export type FontWeightTokenValue = (typeof fontWeightTokens)[FontWeightTokenName];

export const fontTokens = {
  "heading-xl": {
    fontSize: "36px",
    lineHeight: "44px",
    fontWeight: fontWeightTokens.bold,
  },
  "heading-lg": {
    fontSize: "30px",
    lineHeight: "38px",
    fontWeight: fontWeightTokens.bold,
  },
  "heading-md": {
    fontSize: "24px",
    lineHeight: "32px",
    fontWeight: fontWeightTokens.semibold,
  },
  "body-md": {
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: fontWeightTokens.regular,
  },
  "body-sm": {
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: fontWeightTokens.regular,
  },
} as const;

export type FontTokenName = keyof typeof fontTokens;
export type FontToken = (typeof fontTokens)[FontTokenName];

export const spacingTokens = {
  "spacing-xs": "4px",
  "spacing-sm": "8px",
  "spacing-md": "16px",
  "spacing-lg": "24px",
  "spacing-xl": "32px",
} as const;

export type SpacingTokenName = keyof typeof spacingTokens;
export type SpacingTokenValue = (typeof spacingTokens)[SpacingTokenName];

export type DesignTokens = {
  color: typeof colorTokens;
  font: typeof fontTokens;
  spacing: typeof spacingTokens;
};

export const designTokens: DesignTokens = {
  color: colorTokens,
  font: fontTokens,
  spacing: spacingTokens,
};

export default designTokens;
