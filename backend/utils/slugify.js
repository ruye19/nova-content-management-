const baseSlugify = (input = "") =>
  input
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

async function ensureUniqueSlug(pool, desiredSlug, excludeId = null) {
  let slug = desiredSlug || "untitled";
  let counter = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const params = [slug];
    let query = "SELECT id FROM Contents WHERE slug = ?";
    if (excludeId) {
      query += " AND id <> ?";
      params.push(excludeId);
    }
    const [rows] = await pool.execute(query, params);
    if (!rows.length) {
      return slug;
    }
    slug = `${desiredSlug}-${counter}`;
    counter += 1;
  }
}

module.exports = { slugify: baseSlugify, ensureUniqueSlug };
