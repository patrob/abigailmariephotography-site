export interface Env {
  ASSETS: Fetcher;
}

const CANONICAL_HOST = "abigailmariephotography.com";

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

    return env.ASSETS.fetch(request);
  },
};
