import { NextResponse } from "next/server";
import { readAdminFormBody } from "@/lib/admin/read-admin-form-body";
import { respondAdminFormSave } from "@/lib/admin/respond-admin-form-save";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { isSessionError, requireAdminSession } from "@/lib/auth/require-session";
import {
  createSessionToken,
  getSessionCookieOptions,
  toSessionUser,
} from "@/lib/auth/session";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { getAdminUserPasswordHash, updateAdminUserProfile } from "@/lib/auth/users";
import type { SessionPayload } from "@/lib/auth/types";

type ProfileBody = {
  fullName?: string;
  currentPassword?: string;
  newPassword?: string;
};

async function updateProfile(request: Request, sessionResult: SessionPayload) {
  const { body, prefersJson } = await readAdminFormBody<ProfileBody>(request);
  const fullName = body.fullName?.trim() ?? "";
  const currentPassword = body.currentPassword ?? "";
  const newPassword = body.newPassword?.trim() ?? "";

  if (!fullName) {
    throw new Error("El nombre es obligatorio.");
  }

  let passwordHash: string | undefined;

  if (newPassword) {
    if (newPassword.length < 8) {
      throw new Error("La nueva contraseña debe tener al menos 8 caracteres.");
    }

    if (!currentPassword) {
      throw new Error("Debes ingresar tu contraseña actual.");
    }

    const storedHash = await getAdminUserPasswordHash(sessionResult.sub);
    if (!storedHash) {
      throw new Error("Usuario no encontrado.");
    }

    const isValid = await verifyPassword(currentPassword, storedHash);
    if (!isValid) {
      throw new Error("La contraseña actual no es correcta.");
    }

    passwordHash = await hashPassword(newPassword);
  }

  const updatedUser = await updateAdminUserProfile(sessionResult.sub, {
    fullName,
    passwordHash,
  });

  if (!updatedUser) {
    throw new Error("No fue posible actualizar el perfil.");
  }

  const sessionUser = {
    id: updatedUser.id,
    email: updatedUser.email,
    name: updatedUser.full_name,
    role: updatedUser.role,
  };

  const token = await createSessionToken(sessionUser);
  const response = respondAdminFormSave(
    request,
    "/admin/perfil?saved=1",
    { user: sessionUser, message: "Perfil actualizado correctamente." },
    prefersJson,
  );

  response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions(request));
  return response;
}

export async function PATCH(request: Request) {
  const sessionResult = await requireAdminSession();
  if (isSessionError(sessionResult)) {
    return sessionResult;
  }

  try {
    return await updateProfile(request, sessionResult);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible actualizar el perfil.";
    const status =
      message.includes("obligatorio") ||
      message.includes("contraseña") ||
      message.includes("encontrado") ||
      message.includes("Debes")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  return PATCH(request);
}

export async function GET() {
  const sessionResult = await requireAdminSession();
  if (isSessionError(sessionResult)) {
    return sessionResult;
  }

  return NextResponse.json({ user: toSessionUser(sessionResult) });
}
