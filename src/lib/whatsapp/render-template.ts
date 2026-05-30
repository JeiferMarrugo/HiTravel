export type TemplateVariables = Record<string, string>;

export function renderMessageTemplate(body: string, variables: TemplateVariables): string {
  let output = body;

  for (const [key, value] of Object.entries(variables)) {
    const placeholder = key.startsWith("{{") ? key : `{{${key}}}`;
    output = output.split(placeholder).join(value);
  }

  return output.trim();
}

export function formatCheckinDate(isoDate: string, locale = "es-CO") {
  const date = new Date(isoDate);
  return date.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatCheckinTime(isoDate: string, locale = "es-CO") {
  const date = new Date(isoDate);
  return date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
}
