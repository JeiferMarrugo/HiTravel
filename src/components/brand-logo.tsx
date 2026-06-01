import Image, { type StaticImageData } from "next/image";
import logo from "@/public/images/logo.png";
import { isUploadedSiteImage } from "@/lib/site-content/utils";

export const LOCAL_BRAND_LOGO = "/images/logo.png";

type BrandLogoProps = {
  name: string;
  logoUrl?: string;
  variant?: "default" | "on-dark";
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
};

function shouldUseBundledLogo(logoUrl: string | undefined): boolean {
  if (!logoUrl) {
    return true;
  }

  return (
    logoUrl.includes("googleusercontent.com") ||
    logoUrl.includes("logo_hitravel") ||
    logoUrl === LOCAL_BRAND_LOGO ||
    logoUrl === "/images/logo-light.png"
  );
}

export function BrandLogo({
  name,
  logoUrl,
  variant = "default",
  className = "h-10 w-auto",
  width = 180,
  height = 72,
  priority = false,
}: BrandLogoProps) {
  const useBundledLogo = shouldUseBundledLogo(logoUrl);
  const src: string | StaticImageData = useBundledLogo ? logo : logoUrl!;

  const image = (
    <Image
      src={src}
      alt={name}
      width={width}
      height={height}
      priority={priority}
      unoptimized={!useBundledLogo && isUploadedSiteImage(logoUrl!)}
      className={`object-contain object-left ${className}`}
    />
  );

  if (variant === "on-dark") {
    return (
      <span className="inline-flex rounded-2xl bg-white px-3 py-2 shadow-sm">
        {image}
      </span>
    );
  }

  return image;
}
