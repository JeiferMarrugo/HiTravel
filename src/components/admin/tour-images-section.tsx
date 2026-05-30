"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";

type TourImagesSectionProps = {
  heroImageUrl: string | null;
  gallery: string[];
  isUploading: boolean;
  onHeroChange: (url: string | null) => void;
  onGalleryChange: (urls: string[]) => void;
  onUpload: (file: File, target: "hero" | "gallery") => Promise<void>;
};

function isLocalUpload(url: string) {
  return url.startsWith("/uploads");
}

export function TourImagesSection({
  heroImageUrl,
  gallery,
  isUploading,
  onHeroChange,
  onGalleryChange,
  onUpload,
}: TourImagesSectionProps) {
  const heroInputId = useId();
  const galleryInputId = useId();
  const [showUrlField, setShowUrlField] = useState(false);
  const [urlDraft, setUrlDraft] = useState(heroImageUrl ?? "");

  useEffect(() => {
    setUrlDraft(heroImageUrl ?? "");
  }, [heroImageUrl]);

  async function handleFiles(files: FileList | null, target: "hero" | "gallery") {
    if (!files?.length) {
      return;
    }
    if (target === "hero") {
      await onUpload(files[0], "hero");
      return;
    }
    for (const file of Array.from(files)) {
      await onUpload(file, "gallery");
    }
  }

  return (
    <article className="overflow-hidden rounded-[2rem] bg-white coastal-shadow">
      <div className="border-b border-outline-variant/15 bg-gradient-to-r from-primary/5 to-secondary-container/30 px-6 py-5">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-[22px]">photo_library</span>
          </span>
          <div>
            <h2 className="text-lg font-semibold text-primary">Imágenes</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              La portada aparece en el listado y al inicio de la ficha. La galería se muestra en el detalle del tour.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8 p-6">
        {/* Portada */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-primary">Imagen de portada</h3>
              <p className="text-xs text-on-surface-variant">Recomendado: horizontal, mín. 1200×675 px</p>
            </div>
            {heroImageUrl ? (
              <button
                type="button"
                onClick={() => {
                  onHeroChange(null);
                  setUrlDraft("");
                }}
                className="text-xs font-semibold text-red-600 hover:underline"
              >
                Quitar portada
              </button>
            ) : null}
          </div>

          {heroImageUrl ? (
            <div className="group relative overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-low">
              <div className="relative aspect-[21/9] w-full min-h-[180px] max-h-[280px]">
                <Image
                  src={heroImageUrl}
                  alt="Vista previa de portada"
                  fill
                  className="object-cover transition duration-300 group-hover:scale-[1.02]"
                  unoptimized={isLocalUpload(heroImageUrl)}
                  sizes="(max-width: 768px) 100vw, 800px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 opacity-0 transition group-hover:opacity-100">
                  <label
                    htmlFor={heroInputId}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-primary shadow-md backdrop-blur"
                  >
                    <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                    Cambiar imagen
                  </label>
                </div>
                <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white shadow">
                  Portada
                </span>
              </div>
            </div>
          ) : (
            <label
              htmlFor={heroInputId}
              className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition ${
                isUploading
                  ? "border-primary/40 bg-primary/5"
                  : "border-outline-variant/35 bg-surface-container-lowest hover:border-primary/50 hover:bg-secondary-container/20"
              }`}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary-container text-primary">
                <span className="material-symbols-outlined text-[28px]">
                  {isUploading ? "progress_activity" : "add_photo_alternate"}
                </span>
              </span>
              <div className="text-center">
                <p className="text-sm font-semibold text-primary">
                  {isUploading ? "Subiendo portada..." : "Arrastra o haz clic para subir la portada"}
                </p>
                <p className="mt-1 text-xs text-on-surface-variant">JPG, PNG o WebP · máx. 8 MB</p>
              </div>
            </label>
          )}

          <input
            id={heroInputId}
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={isUploading}
            onChange={(e) => {
              void handleFiles(e.target.files, "hero");
              e.target.value = "";
            }}
          />

          <button
            type="button"
            onClick={() => setShowUrlField((value) => !value)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <span className="material-symbols-outlined text-[16px]">link</span>
            {showUrlField ? "Ocultar enlace manual" : "Pegar URL de imagen"}
          </button>

          {showUrlField ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={urlDraft}
                onChange={(e) => setUrlDraft(e.target.value)}
                placeholder="https://..."
                className="min-w-0 flex-1 rounded-xl border border-outline-variant/30 px-4 py-2.5 text-sm"
              />
              <button
                type="button"
                onClick={() => onHeroChange(urlDraft.trim() || null)}
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white"
              >
                Aplicar URL
              </button>
            </div>
          ) : null}
        </section>

        {/* Galería */}
        <section className="space-y-3 border-t border-outline-variant/15 pt-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-primary">Galería</h3>
              <p className="text-xs text-on-surface-variant">
                {gallery.length === 0
                  ? "Añade fotos del destino, actividades o grupo"
                  : `${gallery.length} foto${gallery.length === 1 ? "" : "s"} en la galería`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {gallery.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-low shadow-sm"
              >
                <Image
                  src={url}
                  alt={`Galería ${index + 1}`}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-105"
                  unoptimized={isLocalUpload(url)}
                  sizes="200px"
                />
                <div className="absolute inset-0 bg-primary/0 transition group-hover:bg-primary/25" />
                <button
                  type="button"
                  aria-label={`Eliminar imagen ${index + 1}`}
                  onClick={() => onGalleryChange(gallery.filter((_, i) => i !== index))}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-red-600 opacity-0 shadow-md transition group-hover:opacity-100"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
                <span className="absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white">
                  {index + 1}
                </span>
              </div>
            ))}

            <label
              htmlFor={galleryInputId}
              className={`flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition ${
                isUploading
                  ? "border-primary/40 bg-primary/5"
                  : "border-outline-variant/35 bg-surface-container-lowest hover:border-primary/50 hover:bg-secondary-container/15"
              }`}
            >
              <span className="material-symbols-outlined text-[28px] text-primary">add</span>
              <span className="px-2 text-center text-xs font-semibold text-primary">Añadir foto</span>
            </label>
          </div>

          <input
            id={galleryInputId}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            disabled={isUploading}
            onChange={(e) => {
              void handleFiles(e.target.files, "gallery");
              e.target.value = "";
            }}
          />
        </section>
      </div>
    </article>
  );
}
