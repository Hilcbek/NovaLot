// features/auth/hooks/use-logout.ts
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/api/auth.api";
import { setAccessToken } from "@/lib/token";
import { getQueryClient } from "@/components/providers/AppProvider";
import { useAuthStore } from "./use-auth";

export function useLogout() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: logoutUser,
    onSettled: () => {
      // Clear local state whether the API call succeeded or failed
      setAccessToken(null);
      logout();
      getQueryClient().clear();
      router.push("/sign-in");
    },
  });
}