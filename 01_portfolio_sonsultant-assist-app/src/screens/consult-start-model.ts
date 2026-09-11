import type { ScrId } from "@/mock/types";

export function consultScreenVariant(
  screenVariant: Partial<Record<ScrId, string>>,
): string | undefined {
  return screenVariant["SCR-003"];
}

export function routeAfterConsultStart(sessionId: string): `/consult/${string}` {
  return `/consult/${sessionId}`;
}

export function retainConsultBody(body: string): string {
  return body;
}

export function shouldNavigateAfterStart(
  result: { ok: true; value: string } | { ok: false; error: { code: string } },
): result is { ok: true; value: string } {
  return result.ok;
}

export function containsMockConfidentialCandidate(body: string): boolean {
  return body.includes("株式会社");
}

export function isMaskingVariant(variant: string | undefined): boolean {
  return variant === "機密候補検知" || variant === "MASKING";
}

export function shouldShowMaskingConfirmation(
  body: string,
  variant: string | undefined,
): boolean {
  return isMaskingVariant(variant) || containsMockConfidentialCandidate(body);
}

export function canStartConsultAfterMasking(
  needsMasking: boolean,
  acknowledged: boolean,
): boolean {
  return !needsMasking || acknowledged;
}

export function mockMaskedPreview(body: string): string {
  return body.replaceAll("株式会社", "＊＊");
}
