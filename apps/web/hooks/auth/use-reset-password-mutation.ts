// features/auth/hooks/use-reset-password-mutation.ts
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { resetPassword } from "@/api/auth.api";

export function useResetPasswordMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      router.push("/sign-in?resetSuccess=1");
    },
  });
}