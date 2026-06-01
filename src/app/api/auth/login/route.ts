import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth/password";
import {
  createSessionToken,
  getSessionCookieOptions,
  getSessionFromCookies,
  toSessionUser,
} from "@/lib/auth/session";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/constants";
import { findAdminUserByEmail } from "@/lib/auth/users";
import { safeRedirectUrl, sanitizeRedirectPath } from "@/lib/http/request-url";

type LoginBody = {
  email?: string;
  password?: string;
  redirect?: string;
};

async function authenticate(email: string, password: string) {
  const user = await findAdminUserByEmail(email);

  if (!user || !user.is_active) {
    return { error: "Credenciales inválidas.", status: 401 as const };
  }

  const validPassword = await verifyPassword(password, user.password_hash);
  if (!validPassword) {
    return { error: "Credenciales inválidas.", status: 401 as const };
  }

  const sessionUser = {
    id: user.id,
    email: user.email,
    name: user.full_name,
    role: user.role,
  };

  const token = await createSessionToken(sessionUser);
  return { sessionUser, token };
}

function resolveLoginRedirect(request: Request, redirect?: string): string {
  const candidate = redirect?.trim();
  if (candidate && candidate.startsWith("/admin") && !candidate.startsWith("//")) {
    return sanitizeRedirectPath(candidate);
  }
  return "/admin";
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    const prefersJson = contentType.includes("application/json");
    let email = "";
    let password = "";
    let redirectPath = "/admin";

    if (prefersJson) {
      const body = (await request.json()) as LoginBody;
      email = body.email?.trim() ?? "";
      password = body.password ?? "";
      redirectPath = resolveLoginRedirect(request, body.redirect);
    } else {
      const form = await request.formData();
      email = form.get("email")?.toString().trim() ?? "";
      password = form.get("password")?.toString() ?? "";
      redirectPath = resolveLoginRedirect(request, form.get("redirect")?.toString());
    }

    if (!email || !password) {
      return NextResponse.json({ error: "Correo y contraseña son obligatorios." }, { status: 400 });
    }

    const auth = await authenticate(email, password);
    if ("error" in auth) {
      if (prefersJson) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
      }

      const loginUrl = safeRedirectUrl(request, "/admin/login");
      loginUrl.searchParams.set("error", "invalid");
      return NextResponse.redirect(loginUrl, 303);
    }

    const cookieOptions = getSessionCookieOptions(request);

    if (prefersJson) {
      const response = NextResponse.json({
        user: auth.sessionUser,
        accessToken: auth.token,
        tokenType: "Bearer",
        expiresIn: SESSION_MAX_AGE_SECONDS,
        message: "Inicio de sesión exitoso.",
      });
      response.cookies.set(SESSION_COOKIE_NAME, auth.token, cookieOptions);
      return response;
    }

    const response = NextResponse.redirect(safeRedirectUrl(request, redirectPath), 303);
    response.cookies.set(SESSION_COOKIE_NAME, auth.token, cookieOptions);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible iniciar sesión.";
    const status = message.includes("Falta configurar") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Sesión no válida." }, { status: 401 });
  }

  return NextResponse.json({ user: toSessionUser(session) });
}
