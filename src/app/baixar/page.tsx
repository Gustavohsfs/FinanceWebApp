import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Download, ShieldCheck, Smartphone } from "lucide-react";
import QRCode from "qrcode";

import { APP_DOWNLOAD_FILENAME, APP_DOWNLOAD_URL } from "@/shared/lib/download";

export const metadata: Metadata = {
  title: "Baixe o app — Fluxo",
  description: "Baixe o app Android do Fluxo e registre suas finanças em 5 segundos.",
};

const STEPS = [
  {
    icon: Download,
    title: "Baixe o APK",
    body: "Toque em “Baixar APK” pelo celular. O arquivo fica na pasta de downloads.",
  },
  {
    icon: ShieldCheck,
    title: "Permita a instalação",
    body: "Se o Android pedir, autorize “instalar de fontes desconhecidas” para o navegador.",
  },
  {
    icon: Smartphone,
    title: "Abra e instale",
    body: "Toque no arquivo baixado, confirme e pronto — o Fluxo aparece na sua tela inicial.",
  },
] as const;

/** QR com módulos escuros sobre fundo claro — melhor leitura pela câmera. */
async function renderQrSvg(): Promise<string> {
  return QRCode.toString(APP_DOWNLOAD_URL, {
    type: "svg",
    margin: 1,
    color: { dark: "#08080a", light: "#ffffff" },
  });
}

export default async function DownloadPage() {
  const qrSvg = await renderQrSvg();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-12 sm:py-20">
      <Link
        href="/"
        className="mb-10 inline-flex w-fit items-center gap-2 text-small text-bone-600 transition-colors hover:text-bone"
      >
        <ArrowLeft className="size-4" />
        Voltar
      </Link>

      <div className="flex items-center gap-2">
        <span className="size-2.5 rounded-full bg-flame-500" />
        <span className="font-display text-title font-semibold text-bone">Fluxo</span>
      </div>

      <h1 className="mt-8 font-display text-display font-semibold text-bone">
        Leve o Fluxo no bolso.
      </h1>
      <p className="mt-2 max-w-md text-body text-bone-600">
        O app Android registra suas finanças em 5 segundos. O web mostra o que esses
        segundos constroem.
      </p>

      <div className="mt-10 grid gap-8 sm:grid-cols-[1fr_auto] sm:items-start">
        {/* Passos de instalação */}
        <ol className="flex flex-col gap-5">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-ink-800 bg-ink-900 text-bone-600">
                <step.icon className="size-4" />
              </span>
              <div className="flex flex-col gap-0.5">
                <p className="text-body font-medium text-bone">
                  {i + 1}. {step.title}
                </p>
                <p className="text-small text-bone-600">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* QR para desktop → celular */}
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-ink-800 bg-ink-900 p-5">
          <div
            className="size-40 overflow-hidden rounded-xl bg-bone p-2 [&_svg]:size-full"
            // QR estático gerado no servidor; sem input do usuário.
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
          <p className="max-w-[10rem] text-center text-micro text-bone-800">
            No computador? Aponte a câmera do celular para baixar.
          </p>
        </div>
      </div>

      <a
        href={APP_DOWNLOAD_URL}
        download={APP_DOWNLOAD_FILENAME}
        className="mt-10 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-flame-500 px-6 text-base font-medium text-bone transition-colors hover:bg-flame-400 sm:w-fit"
      >
        <Download className="size-5" />
        Baixar APK
      </a>

      <p className="mt-4 text-micro text-bone-800">
        Android · versão beta · disponível fora das lojas por enquanto.
      </p>
    </main>
  );
}
