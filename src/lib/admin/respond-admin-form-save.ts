import { NextResponse } from "next/server";
import { safeRedirectUrl } from "@/lib/http/request-url";

export function respondAdminFormSave(
  request: Request,
  redirectPath: string,
  data: unknown,
  prefersJson: boolean,
  jsonInit?: ResponseInit,
) {
  if (prefersJson) {
    return NextResponse.json(data, jsonInit);
  }

  return NextResponse.redirect(safeRedirectUrl(request, redirectPath), 303);
}
