// lib/api/token.ts
import Cookies from "js-cookie";

const ACCESS_TOKEN_KEY = "accessToken";

export const getAccessToken = (): string | undefined => {
  return Cookies.get(ACCESS_TOKEN_KEY);
};

export const setAccessToken = (token: string | null): void => {
  if (token) {
    Cookies.set(ACCESS_TOKEN_KEY, token, {
      expires: 1 / 96,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  } else {
    Cookies.remove(ACCESS_TOKEN_KEY);
  }
};