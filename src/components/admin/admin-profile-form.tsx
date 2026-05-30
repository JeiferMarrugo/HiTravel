"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/toast";

type ProfileUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export function AdminProfileForm() {
  const router = useRouter();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [fullName, setFullName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/auth/profile");
        const payload = (await response.json()) as { user?: ProfileUser; error?: string };

        if (!response.ok || !payload.user) {
          throw new Error(payload.error ?? "No fue posible cargar el perfil.");
        }

        setUser(payload.user);
        setFullName(payload.user.name);
      } catch (error) {
        notify.error(error instanceof Error ? error.message : "No fue posible cargar el perfil.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadProfile();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const payload = (await response.json()) as { error?: string; message?: string; user?: ProfileUser };

      if (!response.ok) {
        throw new Error(payload.error ?? "No fue posible guardar los cambios.");
      }

      if (payload.user) {
        setUser(payload.user);
        setFullName(payload.user.name);
      }

      setCurrentPassword("");
      setNewPassword("");
      notify.success(payload.message ?? "Perfil actualizado correctamente.");
      router.refresh();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "No fue posible guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <div className="rounded-[2rem] bg-white p-8 text-sm text-on-surface-variant coastal-shadow">Cargando perfil...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[2rem] bg-white p-8 coastal-shadow">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-primary">Mi perfil</h1>
        <p className="mt-2 text-sm text-on-surface-variant">Actualiza tu nombre y contraseña de acceso al panel.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label htmlFor="profile-email" className="text-sm font-semibold text-on-surface-variant">
            Correo electrónico
          </label>
          <input
            id="profile-email"
            type="email"
            value={user?.email ?? ""}
            disabled
            className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container px-4 py-3 text-on-surface-variant"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="profile-name" className="text-sm font-semibold text-on-surface-variant">
            Nombre completo
          </label>
          <input
            id="profile-name"
            type="text"
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="profile-current-password" className="text-sm font-semibold text-on-surface-variant">
            Contraseña actual
          </label>
          <input
            id="profile-current-password"
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            placeholder="Solo si vas a cambiar la contraseña"
            className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="profile-new-password" className="text-sm font-semibold text-on-surface-variant">
            Nueva contraseña
          </label>
          <input
            id="profile-new-password"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="Mínimo 8 caracteres"
            className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
