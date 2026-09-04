export async function completeAuthCallback(
  code: string | null,
  exchangeCode: (code: string) => Promise<{ error: unknown }>,
): Promise<"/" | "/login"> {
  if (!code) {
    return "/login";
  }

  const { error } = await exchangeCode(code);
  if (error) {
    return "/login";
  }

  return "/";
}
