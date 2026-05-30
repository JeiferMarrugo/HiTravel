import { NextResponse } from "next/server";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { isSessionError, requireAdminSession } from "@/lib/auth/require-session";
import {
  createSessionToken,
  getSessionCookieOptions,
  toSessionUser,
} from "@/lib/auth/session";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { getAdminUserPasswordHash, updateAdminUserProfile } from "@/lib/auth/users";

type ProfileBody = {
  fullName?: string;
  currentPassword?: string;
  newPassword?: string;
};

export async function PATCH(request: Request) {
  const sessionResult = await requireAdminSession();
  if (isSessionError(sessionResult)) {
    return sessionResult;
  }

  try {
    const body = (await request.json()) as ProfileBody;
    const fullName = body.fullName?.trim() ?? "";
    const currentPassword = body.currentPassword ?? "";
    const newPassword = body.newPassword?.trim() ?? "";

    if (!fullName) {
      return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
    }

    let passwordHash: string | undefined;

    if (newPassword) {
      if (newPassword.length < 8) {
        return NextResponse.json({ error: "La nueva contraseña debe tener al menos 8 caracteres." }, { status: 400 });
      }

      if (!currentPassword) {
        return NextResponse.json({ error: "Debes ingresar tu contraseña actual." }, { status: 400 });
      }

      const storedHash = await getAdminUserPasswordHash(sessionResult.sub);
      if (!storedHash) {
        return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
      }

      const isValid = await verifyPassword(currentPassword, storedHash);
      if (!isValid) {
        return NextResponse.json({ error: "La contraseña actual no es correcta." }, { status: 400 });
      }

      passwordHash = await hashPassword(newPassword);
    }

    const updatedUser = await updateAdminUserProfile(sessionResult.sub, {
      fullName,
      passwordHash,
    });

    if (!updatedUser) {
      return NextResponse.json({ error: "No fue posible actualizar el perfil." }, { status: 404 });
    }

    const sessionUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.full_name,
      role: updatedUser.role,
    };

    const token = await createSessionToken(sessionUser);
    const response = NextResponse.json({
      user: sessionUser,
      message: "Perfil actualizado correctamente.",
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible actualizar el perfil.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const sessionResult = await requireAdminSession();
  if (isSessionError(sessionResult)) {
    return sessionResult;
  }

  return NextResponse.json({ user: toSessionUser(sessionResult) });
}
