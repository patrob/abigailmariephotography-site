export interface Env {
  ASSETS: Fetcher;
  RESEND_API_KEY?: string;
}

const CANONICAL_HOST = "abigailmariephotography.com";
const CONTACT_EMAIL = "info@abigailmariephotography.com";

function getString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}

async function handleContactRequest(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, { status: 405 });
  }

  if (!env.RESEND_API_KEY) {
    return jsonResponse({ error: "Contact form is not configured yet." }, { status: 500 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "Please check the form and try again." }, { status: 400 });
  }

  if (getString(payload.website)) {
    return jsonResponse({ ok: true });
  }

  const name = getString(payload.name);
  const email = getString(payload.email);
  const sessionType = getString(payload.sessionType);
  const message = getString(payload.message);

  if (!name || !email || !sessionType || !message) {
    return jsonResponse({ error: "Please fill out your name, email, session type, and message." }, { status: 400 });
  }

  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${getString(payload.phone) || "Not provided"}`,
    `Session type: ${sessionType}`,
    `Session Date / Due Date: ${getString(payload.sessionDate) || "Not provided"}`,
    `Preferred location: ${getString(payload.preferredLocation) || "Not provided"}`,
    `How did you hear about me?: ${getString(payload.referralSource) || "Not provided"}`,
    "",
    "Tell me what you're dreaming of:",
    message,
  ].join("\n");

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Abigail Marie Photography <info@abigailmariephotography.com>",
      to: [CONTACT_EMAIL],
      reply_to: email,
      subject: `Photography inquiry from ${name}`,
      text,
    }),
  });

  if (!resendResponse.ok) {
    return jsonResponse({ error: "The form could not be sent. Please email info@abigailmariephotography.com directly." }, { status: 502 });
  }

  return jsonResponse({ ok: true });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    let redirected = false;

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

    if (url.pathname === "/api/contact") {
      return handleContactRequest(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
