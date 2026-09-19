// features/auth/hooks/use-forgot-password-mutation.ts
import { forgotPassword } from "@/api";
import { useMutation } from "@tanstack/react-query";

export function useForgotPasswordMutation() {
  return useMutation({ mutationFn: forgotPassword });
}