// apps/web/server/imagekit.ts
import "server-only";
import ImageKit from "imagekit";
import { env } from "../../../shared/src/env.server";

export const imagekit = new ImageKit({
  publicKey: env.IMAGEKIT_PUBLIC_KEY,
  privateKey: env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
});