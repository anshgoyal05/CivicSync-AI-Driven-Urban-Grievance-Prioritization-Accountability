import { toast as sonnerToast } from "sonner";

/** Thin wrapper so integration code can swap toast libraries in one place. */
export const toast = {
  success: (message: string) => sonnerToast.success(message),
  error: (message: string) => sonnerToast.error(message),
};
