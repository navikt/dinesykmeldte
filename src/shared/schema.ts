import { z } from 'zod';

import { LocalDateSchema } from '../services/commonApiSchema';

const SporsmalSchema = z.object({
    id: z.string(),
    sporsmalstekst: z.string(),
});

export type Checkbox = z.infer<typeof CheckboxSchema>;
const CheckboxSchema: z.ZodType<{
    id: string;
    type: 'Checkbox';
    sporsmalstekst: string;
    undersporsmal: SoknadSporsmal[];
}> = z.lazy(() =>
    SporsmalSchema.extend({
        type: z.literal('Checkbox'),
        undersporsmal: z.array(SoknadSporsmalSchema),
    }),
);

export type JaNei = z.infer<typeof JaNeiSchema>;
const JaNeiSchema: z.ZodType<{
    id: string;
    type: 'JaNei';
    sporsmalstekst: string;
    svar: string;
    undersporsmal: SoknadSporsmal[];
}> = z.lazy(() =>
    SporsmalSchema.extend({
        type: z.literal('JaNei'),
        svar: z.string(),
        undersporsmal: z.array(SoknadSporsmalSchema),
    }),
);

export type Dato = z.infer<typeof DatoSchema>;
const DatoSchema = SporsmalSchema.extend({
    type: z.literal('Dato'),
    dato: LocalDateSchema,
});

export type Fritekst = z.infer<typeof FritekstSchema>;
const FritekstSchema = SporsmalSchema.extend({
    type: z.literal('Fritekst'),
    svar: z.string(),
});

export type Land = z.infer<typeof LandSchema>;
const LandSchema = SporsmalSchema.extend({
    type: z.literal('Land'),
    svar: z.string(),
});

export type Tall = z.infer<typeof TallSchema>;
const TallSchema = SporsmalSchema.extend({
    type: z.literal('Tall'),
    svar: z.string(),
    undertekst: z.string().nullable(),
    svartype: z.union([z.literal('Prosent'), z.literal('Timer'), z.literal('Belop'), z.literal('Kilometer')]),
});

export type Undertekst = z.infer<typeof UndertekstSchema>;
const UndertekstSchema = SporsmalSchema.extend({
    type: z.literal('Undertekst'),
    html: z.string(),
});

export type Checkboxgruppe = z.infer<typeof CheckboxgruppeSchema>;
const CheckboxgruppeSchema = SporsmalSchema.extend({
    type: z.literal('Checkboxgruppe'),
    checkboxer: z.array(CheckboxSchema),
});

export type RadioGruppe = z.infer<typeof RadioGruppeSchema>;
const RadioGruppeSchema: z.ZodType<{
    id: string;
    type: 'RadioGruppe';
    sporsmalstekst: string;
    undersporsmal: SoknadSporsmal[];
}> = z.lazy(() =>
    SporsmalSchema.extend({
        type: z.literal('RadioGruppe'),
        undersporsmal: z.array(SoknadSporsmalSchema),
    }),
);

export type Behandlingsdager = z.infer<typeof BehandlingsdagerSchema>;
const BehandlingsdagerSchema = SporsmalSchema.extend({
    type: z.literal('Behandlingsdager'),
    behandlingsdagerSporsmal: z.array(
        z.object({
            id: z.string(),
            min: LocalDateSchema,
            max: LocalDateSchema,
            svar: z.string(),
        }),
    ),
});

export type SoknadSporsmal = z.infer<typeof SoknadSporsmalSchema>;
export const SoknadSporsmalSchema = z.union([
    CheckboxSchema,
    JaNeiSchema,
    DatoSchema,
    FritekstSchema,
    LandSchema,
    TallSchema,
    UndertekstSchema,
    CheckboxgruppeSchema,
    RadioGruppeSchema,
    BehandlingsdagerSchema,
]);
