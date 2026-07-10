export interface TemplateVariables {
  company_name: string;
  contact_name: string;
  sender_name: string;
  sender_website?: string;
  calendly_link?: string;
  audit_score?: number;
  issues_summary?: string;
  industry?: string;
  subject?: string;
}

export function renderTemplate(
  template: string,
  variables: TemplateVariables
): string {
  let rendered = template;

  // Replace all {{variable}} placeholders
  const replacements: Record<string, string> = {
    "{{company_name}}": variables.company_name || "your company",
    "{{contact_name}}": variables.contact_name || "there",
    "{{sender_name}}": variables.sender_name || "Knight",
    "{{sender_website}}": variables.sender_website || "",
    "{{calendly_link}}": variables.calendly_link || "",
    "{{audit_score}}": variables.audit_score?.toString() || "N/A",
    "{{issues_summary}}": variables.issues_summary || "several areas for improvement",
    "{{industry}}": variables.industry || "your industry",
    "{{subject}}": variables.subject || "",
  };

  for (const [placeholder, value] of Object.entries(replacements)) {
    rendered = rendered.split(placeholder).join(value);
  }

  return rendered;
}

export function renderSubject(
  subject: string,
  variables: TemplateVariables
): string {
  return renderTemplate(subject, variables);
}

export function getAvailableVariables(): { name: string; description: string }[] {
  return [
    { name: "company_name", description: "Target company name" },
    { name: "contact_name", description: "Contact person's name" },
    { name: "sender_name", description: "Your company name" },
    { name: "sender_website", description: "Your website URL" },
    { name: "calendly_link", description: "Your Calendly booking link" },
    { name: "audit_score", description: "Website audit score (0-100)" },
    { name: "issues_summary", description: "Key issues found during audit" },
    { name: "industry", description: "Target company's industry" },
    { name: "subject", description: "Original email subject (for replies)" },
  ];
}
