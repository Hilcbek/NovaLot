// hooks/auth/use-current-user-query.ts
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { KEYS } from "@/lib/keys";
import { AuthUser } from "@/api/auth.api";
import { useAuthStore } from "./use-auth";
import { httpClient } from "@/lib";

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