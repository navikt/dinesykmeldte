import { format, parseISO } from "date-fns";
import { nb } from "date-fns/locale";

export const formatDato = (dato: string): string =>
  format(parseISO(dato), "d. MMMM yyyy", { locale: nb });

export const formatDatoKort = (dato: string): string =>
  format(parseISO(dato), "d. MMM", { locale: nb });

/** Norsk tallformat med mellomrom som tusenskille. */
export const formatTall = (verdi: number): string =>
  new Intl.NumberFormat("nb-NO").format(verdi);

/**
 * Avslutter en setning uten å doble punktumet. Norske månedsforkortelser ender
 * allerede på punktum («5. okt.»), så naiv sammensetning gir «5. okt..».
 */
export const settPunktum = (tekst: string): string =>
  tekst.endsWith(".") ? tekst : `${tekst}.`;
