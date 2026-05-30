import { cache } from "react";
import { query } from "@/lib/db";
import { defaultSiteContent } from "@/lib/site-content/defaults";
import type { SiteContent, UpdateSiteContentInput } from "@/lib/site-content/types";

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeDeep<T>(base: T, patch: unknown): T {
  if (!isObject(patch)) {
    return base;
  }

  if (Array.isArray(base)) {
    return (Array.isArray(patch) ? patch : base) as T;
  }

  if (!isObject(base)) {
    return patch as T;
  }

  const result = { ...base } as Record<string, unknown>;

  for (const key of Object.keys(patch)) {
    const next = patch[key];
    const current = (base as Record<string, unknown>)[key];

    if (isObject(current) && isObject(next) && !Array.isArray(next)) {
      result[key] = mergeDeep(current, next);
    } else if (next !== undefined) {
      result[key] = next;
    }
  }

  return result as T;
}

function normalizeContent(raw: unknown): SiteContent {
  return mergeDeep(defaultSiteContent, raw);
}

export const getSiteContent = cache(async (): Promise<SiteContent> => {
  try {
    const rows = await query<{ content: unknown }>(
      "SELECT content FROM site_settings WHERE id = 1",
    );
    if (!rows[0]?.content || typeof rows[0].content !== "object") {
      return defaultSiteContent;
    }
    return normalizeContent(rows[0].content);
  } catch {
    return defaultSiteContent;
  }
});

export async function updateSiteContent(input: UpdateSiteContentInput): Promise<SiteContent> {
  const content = normalizeContent(input);
  const rows = await query<{ content: SiteContent; updated_at: Date }>(
    `INSERT INTO site_settings (id, content, updated_at)
     VALUES (1, $1::jsonb, NOW())
     ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()
     RETURNING content, updated_at`,
    [JSON.stringify(content)],
  );
  return normalizeContent(rows[0]?.content ?? content);
}
