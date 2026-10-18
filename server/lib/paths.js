import { join } from "path";

export const ROOT_DIR = join(import.meta.dir, "../..");
export const DIST_DIR = join(ROOT_DIR, "dist");
export const IMAGES_DIR = join(ROOT_DIR, "src/images");
export const IMAGES_URL = "/src/images";
