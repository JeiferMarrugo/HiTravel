import { adminFetch } from "@/lib/admin/admin-fetch";
import { notify } from "@/lib/toast";

type SubmitAdminJsonFormOptions<T> = {
  url: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  payload: string;
  onSuccess?: (data: T) => void | Promise<void>;
  setSaving?: (value: boolean) => void;
  errorMessage?: string;
};

export async function submitAdminJsonForm<T>(
  event: React.FormEvent<HTMLFormElement>,
  {
    url,
    method = "POST",
    payload,
    onSuccess,
    setSaving,
    errorMessage = "Error al guardar.",
  }: SubmitAdminJsonFormOptions<T>,
) {
  event.preventDefault();
  setSaving?.(true);

  const form = event.currentTarget;

  try {
    const response = await adminFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: payload,
    });

    const data = (await response.json()) as T & { error?: string };

    if (!response.ok) {
      notify.error(data.error ?? errorMessage);
      return;
    }

    await onSuccess?.(data);
  } catch {
    form.submit();
  } finally {
    setSaving?.(false);
  }
}
