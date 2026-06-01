import Script from "next/script";
import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { LoginExpiredNotice } from "@/components/admin/login-expired-notice";
import { BrandLogo } from "@/components/brand-logo";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_bottom_left,_rgba(254,203,0,0.15),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(130,207,255,0.22),_transparent_28%),#f7f9fb] px-4 py-16">
      <Script id="admin-login-password-toggle" strategy="afterInteractive">
        {`document.addEventListener("change",function(e){var t=e.target;if(!(t instanceof HTMLInputElement)||t.id!=="admin-show-password")return;var p=document.getElementById("admin-password");if(p instanceof HTMLInputElement)p.type=t.checked?"text":"password";},true);`}
      </Script>
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-8 flex justify-center">
          <BrandLogo
            name="HI TRAVEL"
            logoUrl="/images/logo.png"
            className="h-20 w-auto max-w-[260px] sm:h-24 sm:max-w-[300px]"
            width={300}
            height={120}
            priority
          />
        </div>

        <p className="text-lg text-on-surface-variant">Portal de administración</p>

        <div className="mt-8 rounded-[2rem] bg-white p-7 coastal-shadow">
          <Suspense fallback={<div className="py-10 text-sm text-on-surface-variant">Cargando formulario...</div>}>
            <LoginExpiredNotice />
            <AdminLoginForm />
          </Suspense>
        </div>

        <div className="mt-8 flex justify-center gap-4 text-sm text-on-surface-variant/80">
          <a href="#">Términos del servicio</a>
          <span>|</span>
          <a href="#">Política de privacidad</a>
          <span>|</span>
          <span>© 2026 HI TRAVEL</span>
        </div>
      </div>
    </main>
  );
}
