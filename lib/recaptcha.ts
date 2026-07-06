import "server-only";

type RecaptchaResponse = {
  success?: boolean;
  "error-codes"?: string[];
};

export async function verifyRecaptcha(token: string, remoteIp?: string) {
  if (!token) {
    return { ok: false, error: "Please complete the reCAPTCHA check." };
  }

  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    return { ok: false, error: "reCAPTCHA secret key is missing on the server." };
  }

  const body = new URLSearchParams({
    secret,
    response: token
  });

  if (remoteIp) {
    body.set("remoteip", remoteIp);
  }

  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body,
      cache: "no-store"
    });

    if (!response.ok) {
      return { ok: false, error: `reCAPTCHA verification failed with status ${response.status}.` };
    }

    const data = (await response.json()) as RecaptchaResponse;
    if (!data.success) {
      const codes = data["error-codes"]?.join(", ");
      return {
        ok: false,
        error: codes ? `reCAPTCHA verification failed: ${codes}` : "reCAPTCHA verification failed."
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not verify reCAPTCHA."
    };
  }
}

export function getRemoteIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
}
