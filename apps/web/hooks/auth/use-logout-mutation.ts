// features/auth/hooks/use-logout.ts
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getQueryClient } from "@/components/providers/AppProvider";
import { useAuthStore } from "@/hooks";
import { logoutUser } from "@/api";
import { setAccessToken } from "@/lib";

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