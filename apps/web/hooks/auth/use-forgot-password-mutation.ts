// features/auth/hooks/use-forgot-password-mutation.ts
import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "@/api/auth.api";

export function useForgotPasswordMutation() {
  return useMutation({ mutationFn: forgotPassword });
}