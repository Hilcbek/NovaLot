// shared/src/category/slugify.ts
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // strip anything that isn't a letter, digit, space, or hyphen
    .replace(/\s+/g, "-") // spaces -> hyphens
    .replace(/-+/g, "-") // collapse repeated hyphens
    .replace(/^-|-$/g, ""); // trim leading/trailing hyphens
}