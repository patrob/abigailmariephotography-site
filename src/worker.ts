export interface Env {
  ASSETS: Fetcher;
  RESEND_API_KEY?: string;
}

const CANONICAL_HOST = "abigailmariephotography.com";
const CONTACT_TO_EMAIL = "info@abigailmariephotography.com";
const CONTACT_FROM_EMAIL = "Abigail Marie Photography <info@abigailmariephotography.com>";
const RESEND_ENDPOINT = "https://api.resend.com/emails";

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  sessionType?: unknown;
  sessionDate?: unknown;
  preferredLocation?: unknown;
  referralSource?: unknown;
  message?: unknown;
  website?: unknown;
};

type ContactFields = {
  name: string;
  email: string;
  phone: string;
  sessionType: string;
  sessionDate: string;
  preferredLocation: string;
  referralSource: string;
  message: string;
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    let redirected = false;

    if (url.pathname === "/api/contact") {
      return handleContactRequest(request, env);
    }

    if (url.protocol === "http:") {
      url.protocol = "https:";
      redirected = true;
    }

    if (url.hostname !== CANONICAL_HOST) {
      url.hostname = CANONICAL_HOST;
      redirected = true;
    }

    if (redirected) {
      return Response.redirect(url.toString(), 301);
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleContactRequest(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse({ message: "Method not allowed." }, 405, {
      Allow: "POST",
    });
  }

  if (!env.RESEND_API_KEY) {
    return jsonResponse({ message: "Contact form is not configured yet." }, 500);
  }

  let payload: ContactPayload;
  try {
    payload = await readContactPayload(request);
  } catch {
    return jsonResponse({ message: "Please send a valid inquiry." }, 400);
  }

  if (clean(payload.website)) {
    return jsonResponse({ ok: true });
  }

  const fields = normalizeContactFields(payload);
  const missing = getMissingRequiredFields(fields);

  if (missing.length > 0) {
    return jsonResponse(
      { message: `Please complete: ${missing.join(", ")}.` },
      400,
    );
  }

  if (!isValidEmail(fields.email)) {
    return jsonResponse({ message: "Please enter a valid email address." }, 400);
  }

  const resendResponse = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: CONTACT_FROM_EMAIL,
      to: [CONTACT_TO_EMAIL],
      reply_to: fields.email,
      subject: `New photography inquiry from ${fields.name}`,
      text: buildPlainTextEmail(fields),
      html: buildHtmlEmail(fields),
    }),
  });

  if (!resendResponse.ok) {
    const errorText = await resendResponse.text();
    console.error("Resend contact form failed", {
      status: resendResponse.status,
      body: errorText.slice(0, 1000),
    });

    return jsonResponse({ message: "Unable to send the inquiry right now." }, 502);
  }

  return jsonResponse({ ok: true });
}

async function readContactPayload(request: Request): Promise<ContactPayload> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return (await request.json()) as ContactPayload;
  }

  const formData = await request.formData();
  return Object.fromEntries(formData.entries());
}

function normalizeContactFields(payload: ContactPayload): ContactFields {
  return {
    name: clean(payload.name),
    email: clean(payload.email).toLowerCase(),
    phone: clean(payload.phone),
    sessionType: clean(payload.sessionType),
    sessionDate: clean(payload.sessionDate),
    preferredLocation: clean(payload.preferredLocation),
    referralSource: clean(payload.referralSource),
    message: clean(payload.message),
  };
}

function getMissingRequiredFields(fields: ContactFields): string[] {
  const required: Array<[keyof ContactFields, string]> = [
    ["name", "Name"],
    ["email", "Email"],
    ["sessionType", "Session type"],
    ["message", "Tell me what you're dreaming of"],
  ];

  return required
    .filter(([key]) => !fields[key])
    .map(([, label]) => label);
}

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim().slice(0, 2000) : "";
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildPlainTextEmail(fields: ContactFields): string {
  return [
    `Name: ${fields.name}`,
    `Email: ${fields.email}`,
    `Phone: ${fields.phone || "Not provided"}`,
    `Session type: ${fields.sessionType}`,
    `Session Date / Due Date: ${fields.sessionDate || "Not provided"}`,
    `Preferred location: ${fields.preferredLocation || "Not provided"}`,
    `How did you hear about me?: ${fields.referralSource || "Not provided"}`,
    "",
    "Tell me what you're dreaming of:",
    fields.message,
  ].join("\n");
}

function buildHtmlEmail(fields: ContactFields): string {
  const rows: Array<[string, string]> = [
    ["Name", fields.name],
    ["Email", fields.email],
    ["Phone", fields.phone || "Not provided"],
    ["Session type", fields.sessionType],
    ["Session Date / Due Date", fields.sessionDate || "Not provided"],
    ["Preferred location", fields.preferredLocation || "Not provided"],
    ["How did you hear about me?", fields.referralSource || "Not provided"],
  ];

  const tableRows = rows
    .map(
      ([label, value]) => `
        <tr>
          <th style="text-align:left;padding:8px 12px;border-bottom:1px solid #e7ddd4;color:#5d4a3d;">${escapeHtml(label)}</th>
          <td style="padding:8px 12px;border-bottom:1px solid #e7ddd4;color:#2f2a27;">${escapeHtml(value)}</td>
        </tr>`,
    )
    .join("");

  return `
    <div style="font-family:Georgia,serif;color:#2f2a27;line-height:1.5;">
      <h1 style="font-size:22px;font-weight:normal;color:#5d4a3d;">New photography inquiry</h1>
      <table style="border-collapse:collapse;width:100%;max-width:640px;">${tableRows}</table>
      <h2 style="font-size:18px;font-weight:normal;color:#5d4a3d;margin-top:24px;">Tell me what you're dreaming of</h2>
      <p style="white-space:pre-wrap;">${escapeHtml(fields.message)}</p>
    </div>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
  headers: HeadersInit = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...headers,
    },
  });
}
