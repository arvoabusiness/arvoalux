export function checkoutUrlForBrand(checkoutUrl: string, brandHandle: string): string {
  if (brandHandle !== "arvoalux") return checkoutUrl;
  const url = new URL(checkoutUrl);
  url.searchParams.set("locale", "hu");
  return url.toString();
}
