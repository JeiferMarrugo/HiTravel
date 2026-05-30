import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { LoginExpiredNotice } from "@/components/admin/login-expired-notice";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_bottom_left,_rgba(254,203,0,0.15),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(130,207,255,0.22),_transparent_28%),#f7f9fb] px-4 py-16">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white coastal-shadow">
          <div className="text-center leading-tight">
            <p className="text-xl font-extrabold text-primary">HI</p>
            <p className="text-xs italic text-secondary">Travel</p>
          </div>
        </div>

        <h1 className="text-5xl font-extrabold text-primary">HI TRAVEL</h1>
        <p className="mt-3 text-lg text-on-surface-variant">Portal de administración</p>

        <div className="mt-10 rounded-[2rem] bg-white p-7 coastal-shadow">
          <Suspense fallback={<div className="py-10 text-sm text-on-surface-variant">Cargando formulario...</div>}>
            <LoginExpiredNotice />
            <AdminLoginForm />
          </Suspense>
        </div>

        <div className="mx-auto mt-8 inline-flex items-center gap-2 rounded-full bg-white/70 px-5 py-3 text-sm text-on-surface-variant coastal-shadow">
          <span className="material-symbols-outlined text-[18px]">shield_lock</span>
          Conexión segura AES-256
        </div>

        <div className="mt-6 flex justify-center gap-4 text-sm text-on-surface-variant/80">
          <a href="#">Términos del servicio</a>
          <span>|</span>
          <a href="#">Política de privacidad</a>
          <span>|</span>
          <span>© 2024 HI TRAVEL</span>
        </div>
      </div>
    </main>
  );
}
