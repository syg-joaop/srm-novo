export interface UiMapaStatusConfigItem {
  color: string;
  label: string;
}

export type UiMapaStatusConfig = Record<string, UiMapaStatusConfigItem>;

export interface UiMapaLinhaInfo {
  rotulo: string;
  valor: string;
}

export interface UiMapaPonto {
  id?: string | number;
  latitude: number | string;
  longitude: number | string;
  titulo: string;
  subtitulo?: string;
  status?: string;
  linhas?: UiMapaLinhaInfo[];
  popupHtml?: string;
}
