// The storefront's files, bundled into the Worker. (Workers Static Assets would also work;
// bundling keeps deploys to a single authenticated upload.)
import indexHtml from "../public/index.html";
import logoSvg from "../public/assets/logo.svg";
import faviconSvg from "../public/assets/favicon.svg";
import robotsTxt from "../public/robots.txt";
import cv013Light from "../public/print/cv-013_front_light.png";
import cv013Dark from "../public/print/cv-013_front_dark.png";

export const STATIC: Record<string, { body: string | ArrayBuffer; type: string }> = {
  "/": { body: indexHtml, type: "text/html; charset=utf-8" },
  "/index.html": { body: indexHtml, type: "text/html; charset=utf-8" },
  "/assets/logo.svg": { body: logoSvg, type: "image/svg+xml" },
  "/assets/favicon.svg": { body: faviconSvg, type: "image/svg+xml" },
  "/robots.txt": { body: robotsTxt, type: "text/plain; charset=utf-8" },
  "/print/cv-013_front_light.png": { body: cv013Light, type: "image/png" },
  "/print/cv-013_front_dark.png": { body: cv013Dark, type: "image/png" },
};
