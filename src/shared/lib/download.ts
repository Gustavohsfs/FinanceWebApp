/**
 * Fonte única da URL de download do app Android (Fluxo mobile).
 *
 * O APK é publicado como asset de um GitHub Release do repo do app mobile; o
 * caminho `releases/latest/download/<arquivo>` sempre aponta para o release mais
 * recente marcado como "latest", então não precisa mudar a cada versão.
 */
export const APP_DOWNLOAD_URL =
  "https://github.com/Gustavohsfs/FinanceMobileApp/releases/latest/download/fluxo.apk";

/** Nome sugerido do arquivo ao baixar. */
export const APP_DOWNLOAD_FILENAME = "fluxo.apk";
