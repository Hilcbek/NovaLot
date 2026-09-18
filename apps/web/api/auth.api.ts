
import { httpClient } from "@/lib";
import { ForgotPasswordInput, LoginInput, ResetPasswordInput, SignupInput } from "@novalot/shared/auth-validation";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export async function registerUser(data: SignupInput): Promise<AuthResponse> {
  const { data: response } = await httpClient.post<AuthResponse>(
    "/auth/sign-up",
    data,
  );
  return response;
}

export async function loginUser(data: LoginInput): Promise<AuthResponse> {
  const { data: response } = await httpClient.post<AuthResponse>(
    "/auth/sign-in",
    data,
  );
  return response;
}

// api/auth.api.ts (or wherever loginUser/registerUser live)
export async function logoutUser(): Promise<void> {
  await httpClient.post("/auth/logout");
}

export async function forgotPassword(data: ForgotPasswordInput): Promise<{ message: string }> {
  const { data: res } = await httpClient.post("/auth/forgot-password", data);
  return res;
}

export async function resetPassword(data: ResetPasswordInput): Promise<{ message: string }> {
  const { data: res } = await httpClient.post("/auth/reset-password", data);
  return res;
}