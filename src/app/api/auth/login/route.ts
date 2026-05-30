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

type LoginBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody;
    const email = body.email?.trim() ?? "";
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json({ error: "Correo y contraseña son obligatorios." }, { status: 400 });
    }

    const user = await findAdminUserByEmail(email);

    if (!user || !user.is_active) {
      return NextResponse.json({ error: "Credenciales inválidas." }, { status: 401 });
    }

    const validPassword = await verifyPassword(password, user.password_hash);
    if (!validPassword) {
      return NextResponse.json({ error: "Credenciales inválidas." }, { status: 401 });
    }

    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.full_name,
      role: user.role,
    };

    const token = await createSessionToken(sessionUser);
    const response = NextResponse.json({
      user: sessionUser,
      accessToken: token,
      tokenType: "Bearer",
      expiresIn: SESSION_MAX_AGE_SECONDS,
      message: "Inicio de sesión exitoso. Para integraciones API usa Authorization: Bearer <accessToken>.",
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());
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
