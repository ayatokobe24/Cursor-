export const REQUIRED_CONSENT_IDS = [
  "thirdParty",
  "noCompanyShare",
  "noHrEval",
] as const;

export type ConsentItemId = (typeof REQUIRED_CONSENT_IDS)[number];

export type ConsentChecks = Record<ConsentItemId, boolean>;

export function createInitialConsentChecks(): ConsentChecks {
  return {
    thirdParty: false,
    noCompanyShare: false,
    noHrEval: false,
  };
}

export function isConsentReady(checks: ConsentChecks): boolean {
  return REQUIRED_CONSENT_IDS.every((id) => checks[id]);
}

export function toggleConsentCheck(
  checks: ConsentChecks,
  id: ConsentItemId,
): ConsentChecks {
  return {
    ...checks,
    [id]: !checks[id],
  };
}

export function routeAfterConsent(): "/consult/new" {
  return "/consult/new";
}
