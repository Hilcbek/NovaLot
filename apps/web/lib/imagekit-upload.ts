// lib/imagekit-upload.ts
import { httpClient } from "@/lib";
import ImageKit from "imagekit-javascript";

export interface UploadedImage {
  fileId: string;
  url: string;
  thumbnailUrl: string;
}

export async function uploadImageToImageKit(
  file: File,
): Promise<UploadedImage> {
  const { data: auth } = await httpClient.get("/imagekit/auth");

  const imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
  });

  return new Promise((resolve, reject) => {
    imagekit.upload(
      {
        file,
        fileName: file.name,
        folder: "/auctions",
        token: auth.token,
        signature: auth.signature,
        expire: auth.expire,
      },
      (err: Error | null, result: any | null) => {
        if (err || !result) return reject(err ?? new Error("Upload failed"));
        resolve({
          fileId: result.fileId,
          url: result.url,
          thumbnailUrl: result.thumbnailUrl,
        });
      },
    );
  });
}

export async function deleteImageFromImageKit(fileId: string): Promise<void> {
  await httpClient.delete(`/imagekit/${fileId}`);
}
