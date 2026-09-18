import { httpClient } from "@/lib/axios";
import { LoginInput, SignupInput } from "@novalot/shared/auth-validation";


export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export async function registerUser(
  data: SignupInput,
): Promise<AuthResponse> {
  const { data: response } = await httpClient.post<AuthResponse>(
    "/auth/register",
    data,
  );
  return response;
}

export async function loginUser(
  data: LoginInput,
): Promise<AuthResponse> {
  const { data: response } = await httpClient.post<AuthResponse>(
    "/auth/login",
    data,
  );
  return response;
}
