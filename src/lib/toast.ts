import { toast } from "sonner";

export const TOAST_DURATION_MS = 5000;

const toastOptions = { duration: TOAST_DURATION_MS };

export const notify = {
  success(message: string) {
    toast.success(message, toastOptions);
  },
  error(message: string) {
    toast.error(message, toastOptions);
  },
  info(message: string) {
    toast.info(message, toastOptions);
  },
  warning(message: string) {
    toast.warning(message, toastOptions);
  },
};
