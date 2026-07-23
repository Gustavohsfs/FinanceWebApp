/**
 * Assinatura HMAC-SHA256 dos cookies de sessão (Web Crypto — roda em Edge e Node).
 * Defesa em profundidade: o token em si já é verificado pela API; isto detecta
 * adulteração do valor do cookie antes mesmo de gastar uma chamada de rede.
 */
import { serverEnv } from "@/core/config/env";

function toBase64Url(bytes: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmacKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(serverEnv.AUTH_COOKIE_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function sign(value: string): Promise<string> {
  const key = await hmacKey();
  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return toBase64Url(signature);
}

export async function signCookieValue(value: string): Promise<string> {
  const signature = await sign(value);
  return `${value}.${signature}`;
}

export async function verifyCookieValue(signed: string): Promise<string | null> {
  const lastDot = signed.lastIndexOf(".");
  if (lastDot === -1) return null;
  const value = signed.slice(0, lastDot);
  const signature = signed.slice(lastDot + 1);
  const expected = await sign(value);
  if (signature.length !== expected.length) return null;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0 ? value : null;
}
