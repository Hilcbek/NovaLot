// hooks/auth/use-current-user-query.ts
import { AuthUser } from "@/api";
import { useAuthStore } from "@/hooks";
import { httpClient, KEYS } from "@/lib";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export function useCurrentUser() {
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  const query = useQuery({
    queryKey: KEYS.auth.session(),
    queryFn: async () => {
      const { data } = await httpClient.get<{ user: AuthUser }>("/auth/me");
      return data.user;
    },
    retry: false,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (query.data) setUser(query.data);
    else if (query.isError) logout();
  }, [query.data, query.isError, setUser, logout]);

  return query;
}
