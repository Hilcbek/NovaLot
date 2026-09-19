// features/auth/hooks/use-reset-password-mutation.ts
import { resetPassword } from "@/api";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function useResetPasswordMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      router.push("/sign-in?resetSuccess=1");
    },
  });
}