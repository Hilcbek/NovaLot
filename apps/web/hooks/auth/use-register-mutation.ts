// features/auth/hooks/use-auth-mutation.ts
import { AuthResponse, loginUser, registerUser } from "@/api/auth.api";
import { getQueryClient } from "@/components/providers/AppProvider";
import { setAccessToken } from "@/lib/token";
import { KEYS } from "@/lib/keys";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "./use-auth";
import { LoginInput, SignupInput } from "@novalot/shared/auth-validation";
type AuthMode = "signup" | "login";
type AuthInput = SignupInput | LoginInput;

export function useAuthMutation(mode: AuthMode) {
  const queryClient = getQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (data: AuthInput) =>
      mode === "signup"
        ? registerUser(data as SignupInput)
        : loginUser(data as LoginInput),
    onSuccess: (data: AuthResponse) => {
      setAccessToken(data.accessToken);
      setUser(data.user);
      queryClient.setQueryData(KEYS.auth.session(), {
        isAuthenticated: true,
        user: data.user,
      });
    },
  });
}
