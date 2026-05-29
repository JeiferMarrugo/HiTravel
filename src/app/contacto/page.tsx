import Image from "next/image";
import { ContactForm } from "@/components/contact-form";
import { contactDetails } from "@/lib/site-data";
import { ContactFooter, TopNav, WhatsappFab } from "@/components/site-chrome";

const heroImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCpWt9hXp92Vh_WU3xK4jMeCco-lqA59em3Pw9VYIzpH70cYB8voOp4Ce07zSnWhEZInLypop3yNZhyjcuO6XBjN87TYIgtlILroBST-1XRH_ymVnSH17jU9GPkIaen8viYaZ_Nmtz2CVD9MOkrhyjnpbaPRqSLPOA7epF-KNXKX40ep543ch9CyUdYLuRk_uFiNPts6z0DYZVn1Pk1TnNhOQqrxr2h0NkLKCtWrjcTFFfwTU93oCVN1s0XQ4e5MmPtfyI1L2xuPA";

const mapImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBqOO1H9de2jdr14vXD2EJU2L52XVX7mSHAcf54dKxjE62bzYmK79H7Y1RgqN7oFO55N4HcEMbQR2l-lCSDL8gv-iFcVDpGa3CqYm0QtrQQBUfBUt3ye3KWMWBOa8VQAKNjyy9Uyom1Ja3M4eGeTi6jQMSgyvlNZg5Ocn2PvpqVQp19HtRQ_ocBJnQ-CsPmxXOX4Q-x8oiUMUuz0WSm4x34lgVUKJzklzlmcsKmoI0x_lPCLSHwgQck5bTsQczyApaj8on2EAmOOw";

export default function ContactPage() {
  return (
    <>
      <TopNav active="contact" />

      <main className="pb-20 pt-32">
        <section className="mx-auto mb-16 max-w-7xl px-4 md:px-16">
          <div className="relative h-[400px] overflow-hidden rounded-xl coastal-shadow">
            <Image src={heroImage} alt="Contacto - HI TRAVEL" fill priority className="object-cover" sizes="100vw" />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-primary/60 to-transparent p-8 md:p-12">
              <h1 className="mb-4 text-[36px] font-extrabold leading-[44px] text-surface-container-lowest md:text-[48px] md:leading-[56px]">
                Planeemos tu <br />
                próxima aventura
              </h1>
              <p className="max-w-2xl text-[18px] leading-7 text-surface-container-lowest/90">
                ¿Tienes preguntas sobre nuestros tours o quieres un itinerario personalizado? Nuestros asesores están
                listos para ayudarte a crear la escapada costera perfecta.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 md:px-16 lg:grid-cols-12">
          <div className="coastal-shadow rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-8 md:p-12 lg:col-span-7">
            <h2 className="mb-8 text-[32px] font-bold leading-[40px] text-primary">Envíanos un mensaje</h2>
            <ContactForm />
          </div>

          <div className="space-y-6 lg:col-span-5">
            <div className="coastal-shadow relative overflow-hidden rounded-xl bg-primary p-8 text-on-primary md:p-10">
              <div className="relative z-10 space-y-6">
                <h3 className="text-[32px] font-bold leading-[40px] text-secondary-container">Ubicación de la oficina</h3>
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-secondary-container">location_on</span>
                  <p className="text-base">
                    123 Coastal Drive, Ocean Plaza
                    <br />
                    Santa Marta, Colombia
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-secondary-container">call</span>
                  <p className="text-base">{contactDetails.phone}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-secondary-container">mail</span>
                  <p className="text-base">{contactDetails.email}</p>
                </div>
                <div className="border-t border-on-primary/10 pt-6">
                  <p className="mb-4 text-sm uppercase tracking-widest text-on-primary/60">Sigue nuestro viaje</p>
                  <div className="flex gap-4">
                    <a className="flex h-10 w-10 items-center justify-center rounded-full border border-on-primary/20 transition-all hover:bg-secondary-container hover:text-on-secondary-container" href="#">
                      <span className="material-symbols-outlined text-base">social_leaderboard</span>
                    </a>
                    <a className="flex h-10 w-10 items-center justify-center rounded-full border border-on-primary/20 transition-all hover:bg-secondary-container hover:text-on-secondary-container" href="#">
                      <span className="material-symbols-outlined text-base">camera</span>
                    </a>
                    <a className="flex h-10 w-10 items-center justify-center rounded-full border border-on-primary/20 transition-all hover:bg-secondary-container hover:text-on-secondary-container" href="#">
                      <span className="material-symbols-outlined text-base">video_library</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative h-[300px] overflow-hidden rounded-xl coastal-shadow">
              <div className="relative flex h-full items-center justify-center overflow-hidden bg-surface-container-high">
                <Image src={mapImage} alt="Mapa de la oficina" fill className="object-cover opacity-80" sizes="(max-width:1024px) 100vw, 40vw" />
                <div className="absolute inset-0 bg-primary/10 transition-colors duration-500 group-hover:bg-transparent" />
                <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-container shadow-lg">
                    <span className="material-symbols-outlined text-on-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                      location_on
                    </span>
                  </div>
                  <div className="mt-2 rounded-lg bg-surface px-3 py-2 text-xs font-semibold text-primary shadow-sm">
                    Oficina HI TRAVEL
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <ContactFooter />
      <WhatsappFab />
    </>
  );
}
