"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { isUploadedSiteImage } from "@/lib/site-content/utils";
import { notify } from "@/lib/toast";

type SiteImageFieldProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  aspectClass?: string;
};

export function SiteImageField({
  label,
  value,
  onChange,
  hint,
  aspectClass = "aspect-[21/9]",
}: SiteImageFieldProps) {
  const inputId = useId();
  const [isUploading, setIsUploading] = useState(false);

  async function handleUpload(file: File) {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "site");
      const response = await fetch("/api/admin/uploads", { method: "POST", body: formData });
      const payload = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? "Error al subir imagen.");
      }
      onChange(payload.url);
      notify.success("Imagen actualizada.");
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error al subir.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-on-surface-variant">{label}</label>
      {hint ? <p className="text-xs text-on-surface-variant">{hint}</p> : null}
      <div className="flex flex-wrap gap-2">
        <label
          htmlFor={inputId}
          className="cursor-pointer rounded-xl bg-secondary-container px-4 py-2 text-sm font-semibold text-primary"
        >
          {isUploading ? "Subiendo..." : "Subir imagen"}
        </label>
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded-xl border border-outline-variant/30 px-4 py-2 text-sm font-semibold text-red-600"
          >
            Quitar
          </button>
        ) : null}
      </div>
      <input
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        disabled={isUploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleUpload(file);
          e.target.value = "";
        }}
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="URL de imagen o sube un archivo"
        className="w-full rounded-xl border border-outline-variant/30 px-4 py-2.5 text-sm"
      />
      {value ? (
        <div className={`relative w-full max-w-lg overflow-hidden rounded-xl border border-outline-variant/20 ${aspectClass} min-h-[120px]`}>
          <Image
            src={value}
            alt=""
            fill
            className="object-cover"
            unoptimized={isUploadedSiteImage(value)}
            sizes="400px"
          />
        </div>
      ) : null}
    </div>
  );
}
