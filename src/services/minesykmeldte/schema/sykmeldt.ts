import { z } from "zod";
import { DialogmoteSchema } from "./dialogmote";
import { OppfolgingsplanSchema } from "./oppfolgingsplan";
import { PreviewSoknadSchema } from "./soknad";
import { SykmeldingSchema } from "./sykmelding";

export type PreviewSykmeldtApi = z.infer<typeof PreviewSykmeldtSchema>;
export const PreviewSykmeldtSchema = z.object({
  narmestelederId: z.string(),
  orgnummer: z.string(),
  orgnavn: z.string(),
  fnr: z.string(),
  navn: z.string(),
  friskmeldt: z.boolean(),
  sykmeldinger: z.array(SykmeldingSchema),
  previewSoknader: z.array(PreviewSoknadSchema),
  dialogmoter: z.array(DialogmoteSchema),
  oppfolgingsplaner: z.array(OppfolgingsplanSchema),
});

export const MineSykmeldteApiSchema = z.array(PreviewSykmeldtSchema);
