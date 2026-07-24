/**
 * Fonte única da URL de download do app Android (Fluxo mobile).
 *
 * O código-fonte do app é privado, então o APK é distribuído por um repo GitHub
 * PÚBLICO dedicado só a releases (`fluxo-releases`) — assets de release em repo
 * privado não são baixáveis sem login. O caminho `releases/latest/download/<arquivo>`
 * sempre aponta para o release mais recente marcado como "latest".
 */
export const APP_DOWNLOAD_URL =
  "https://github.com/Gustavohsfs/FluxoMobileAPK/releases/latest/download/fluxo.apk";

/** Nome sugerido do arquivo ao baixar. */
export const APP_DOWNLOAD_FILENAME = "fluxo.apk";
