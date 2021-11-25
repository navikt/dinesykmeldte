import {
    PreviewSoknadFragment,
    PreviewSykmeldingFragment,
    PreviewSykmeldtFragment,
    SoknadsstatusEnum,
} from '../../graphql/queries/react-query.generated';

export function createPreviewSoknad(overrides?: Partial<PreviewSoknadFragment>): PreviewSoknadFragment {
    return {
        id: 'default-soknad-1',
        fom: '2021-10-01',
        tom: '2021-10-20',
        lest: false,
        sendtDato: '2021-10-05',
        status: SoknadsstatusEnum.Sendt,
        sykmeldingId: 'default-sykmelding-1',
        ...overrides,
    };
}

export function createPreviewSykmelding(overrides?: Partial<PreviewSykmeldingFragment>): PreviewSykmeldingFragment {
    return {
        id: 'default-sykmelding-1',
        fom: '2021-10-01',
        tom: '2021-10-20',
        type: '100%',
        lest: false,
        ...overrides,
    };
}

export function createPreviewSykmeldt(overrides?: Partial<PreviewSykmeldtFragment>): PreviewSykmeldtFragment {
    return {
        navn: 'Ola Normann',
        fnr: '08088012345',
        orgnummer: '123456789',
        friskmeldt: false,
        narmestelederId: 'narmesteleder-1',
        startdatoSykefravar: '2021-06-07',
        previewSykmeldinger: [createPreviewSykmelding()],
        previewSoknader: [],
        ...overrides,
    };
}
