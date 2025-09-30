import { Image, LocalImage } from "@/types/Image";

export function resolveImageSrc(
  img: string | File | Image | LocalImage
  
): 
string {
  // Local file before uploading
  if (img instanceof File) {
    return URL.createObjectURL(img);
  }

  // LocalImage with file property
  if (typeof img === "object" && "file" in img && img.file instanceof File) {
    return URL.createObjectURL(img.file);
  }

  // String path/URL
  if (typeof img === "string") {
    if (img.includes("unsplash.com")) return img;
    if (img.startsWith("/storage/") || img.startsWith("storage/")) {
      return "/" + img.replace(/^\/+/, "");
    }
    // Old DB entry — no /storage prefix
    return "/storage/" + img.replace(/^\/+/, "");
  }

  // Image object from backend
  if (typeof img === "object" && "path" in img) {
    if (img.path.includes("unsplash.com")) return img.path;
    if (img.path.startsWith("/storage/") || img.path.startsWith("storage/")) {
      return "/" + img.path.replace(/^\/+/, "");
    }
    return "/storage/" + img.path.replace(/^\/+/, "");
  }

  return "";
}
