import { render, screen } from '../../utils/test/testUtils';
import { createSoknad } from '../../utils/test/dataCreators';
import { SoknadSporsmalKriterierEnum, SoknadSporsmalSvartypeEnum } from '../../graphql/queries/graphql.generated';

import SoknadPanel from './SoknadPanel';

describe('SoknadPanel', () => {
    it('should show information about Soknad', () => {
        render(<SoknadPanel soknad={createSoknad()} />);

        expect(screen.getByRole('heading', { name: 'Oppsummering fra søknaden' })).toBeInTheDocument();
        expect(screen.getByRole('listitem', { name: 'Søknaden er sendt inn av' })).toHaveTextContent('Test person');
    });

    describe('SporsmalVarianter', () => {
        it('Should show sporsmal for Behandlingsdager if undersporsmal exists', () => {
            render(
                <SoknadPanel
                    soknad={createSoknad({
                        sporsmal: [
                            {
                                id: '687375',
                                tag: 'ENKELTSTAENDE_BEHANDLINGSDAGER_0',
                                sporsmalstekst:
                                    'Hvilke dager måtte du være helt borte fra jobben på grunn av behandling mellom 1. - 24. april 2020?',
                                undertekst: null,
                                svartype: SoknadSporsmalSvartypeEnum.InfoBehandlingsdager,
                                min: null,
                                max: null,
                                kriterieForVisningAvUndersporsmal: null,
                                svar: [],
                                undersporsmal: [
                                    {
                                        id: '687376',
                                        tag: 'ENKELTSTAENDE_BEHANDLINGSDAGER_UKE_0',
                                        sporsmalstekst: '2020-03-31 - 2020-04-03',
                                        undertekst: null,
                                        svartype: SoknadSporsmalSvartypeEnum.RadioGruppeUkekalender,
                                        min: '2020-03-31',
                                        max: '2020-04-03',
                                        kriterieForVisningAvUndersporsmal: null,
                                        svar: [{ verdi: '' }],
                                        undersporsmal: [],
                                    },
                                ],
                            },
                        ],
                    })}
                />,
            );

            expect(
                screen.getByRole('listitem', {
                    name: 'Hvilke dager måtte du være helt borte fra jobben på grunn av behandling mellom 1. - 24. april 2020?',
                }),
            ).toBeInTheDocument();
            expect(screen.getByRole('listitem', { name: '31. mars - 3. april 2020' })).toBeInTheDocument();
            expect(screen.getByText('Ikke til behandling')).toBeInTheDocument();
        });

        it('Should show sporsmal for JaEllerNei, Checkbox and Tall if svar exists and kriterieForVisningAvUndersporsmal matches svar', () => {
            render(
                <SoknadPanel
                    soknad={createSoknad({
                        sporsmal: [
                            {
                                id: '1566424',
                                tag: 'TRANSPORT_TIL_DAGLIG',
                                sporsmalstekst:
                                    'Brukte du bil eller offentlig transport til og fra jobben før du ble sykmeldt?',
                                undertekst: null,
                                svartype: SoknadSporsmalSvartypeEnum.JaNei,
                                min: null,
                                max: null,
                                kriterieForVisningAvUndersporsmal: SoknadSporsmalKriterierEnum.Ja,
                                svar: [{ verdi: 'JA' }],
                                undersporsmal: [
                                    {
                                        id: '1566425',
                                        tag: 'TYPE_TRANSPORT',
                                        sporsmalstekst: 'Hva slags type transport brukte du?',
                                        undertekst: null,
                                        svartype: SoknadSporsmalSvartypeEnum.CheckboxGruppe,
                                        min: null,
                                        max: null,
                                        kriterieForVisningAvUndersporsmal: null,
                                        svar: [],
                                        undersporsmal: [
                                            {
                                                id: '1566426',
                                                tag: 'OFFENTLIG_TRANSPORT_TIL_DAGLIG',
                                                sporsmalstekst: 'Offentlig transport',
                                                undertekst: null,
                                                svartype: SoknadSporsmalSvartypeEnum.Checkbox,
                                                min: null,
                                                max: null,
                                                kriterieForVisningAvUndersporsmal: SoknadSporsmalKriterierEnum.Checked,
                                                svar: [
                                                    {
                                                        verdi: 'CHECKED',
                                                    },
                                                ],
                                                undersporsmal: [
                                                    {
                                                        id: '1566427',
                                                        tag: 'OFFENTLIG_TRANSPORT_BELOP',
                                                        sporsmalstekst:
                                                            'Hvor mye betaler du vanligvis i måneden for offentlig transport?',
                                                        undertekst: '',
                                                        svartype: SoknadSporsmalSvartypeEnum.Belop,
                                                        min: '0',
                                                        max: null,
                                                        kriterieForVisningAvUndersporsmal: null,
                                                        svar: [
                                                            {
                                                                verdi: '800',
                                                            },
                                                        ],
                                                        undersporsmal: [],
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    })}
                />,
            );

            expect(
                screen.getByRole('listitem', {
                    name: 'Brukte du bil eller offentlig transport til og fra jobben før du ble sykmeldt?',
                }),
            ).toBeInTheDocument();
            expect(screen.getByRole('listitem', { name: 'Hva slags type transport brukte du?' })).toBeInTheDocument();
            expect(
                screen.getByRole('listitem', {
                    name: 'Hvor mye betaler du vanligvis i måneden for offentlig transport?',
                }),
            ).toBeInTheDocument();
            expect(screen.getByRole('listitem', { name: '800 kr' })).toBeInTheDocument();
        });

        it('Should show sporsmal for CheckboxGruppe if undersporsmal exists', () => {
            render(
                <SoknadPanel
                    soknad={createSoknad({
                        sporsmal: [
                            {
                                id: '49',
                                tag: 'ANDRE_INNTEKTSKILDER',
                                sporsmalstekst:
                                    'Har du hatt inntekt mens du har vært sykmeldt i perioden 27. mai - 11. juni 2020?',
                                undertekst: null,
                                svartype: SoknadSporsmalSvartypeEnum.JaNei,
                                min: null,
                                max: null,
                                kriterieForVisningAvUndersporsmal: SoknadSporsmalKriterierEnum.Ja,
                                svar: [{ verdi: 'JA' }],
                                undersporsmal: [
                                    {
                                        id: '50',
                                        tag: 'HVILKE_ANDRE_INNTEKTSKILDER',
                                        sporsmalstekst: 'Hvilke inntektskilder har du hatt?',
                                        undertekst: null,
                                        svartype: SoknadSporsmalSvartypeEnum.CheckboxGruppe,
                                        min: null,
                                        max: null,
                                        kriterieForVisningAvUndersporsmal: null,
                                        svar: [],
                                        undersporsmal: [
                                            {
                                                id: '51',
                                                tag: 'INNTEKTSKILDE_ANDRE_ARBEIDSFORHOLD',
                                                sporsmalstekst: 'andre arbeidsforhold',
                                                undertekst: null,
                                                svartype: SoknadSporsmalSvartypeEnum.Checkbox,
                                                min: null,
                                                max: null,
                                                kriterieForVisningAvUndersporsmal: SoknadSporsmalKriterierEnum.Checked,
                                                svar: [{ verdi: 'CHECKED' }],
                                                undersporsmal: [
                                                    {
                                                        id: '52',
                                                        tag: 'INNTEKTSKILDE_ANDRE_ARBEIDSFORHOLD_ER_DU_SYKMELDT',
                                                        sporsmalstekst: 'Er du sykmeldt fra dette?',
                                                        undertekst: null,
                                                        svartype: SoknadSporsmalSvartypeEnum.JaNei,
                                                        min: null,
                                                        max: null,
                                                        kriterieForVisningAvUndersporsmal: null,
                                                        svar: [{ verdi: 'JA' }],
                                                        undersporsmal: [],
                                                    },
                                                ],
                                            },
                                            {
                                                id: '53',
                                                tag: 'INNTEKTSKILDE_SELVSTENDIG',
                                                sporsmalstekst: 'selvstendig næringsdrivende',
                                                undertekst: null,
                                                svartype: SoknadSporsmalSvartypeEnum.Checkbox,
                                                min: null,
                                                max: null,
                                                kriterieForVisningAvUndersporsmal: SoknadSporsmalKriterierEnum.Checked,
                                                svar: [{ verdi: 'CHECKED' }],
                                                undersporsmal: [
                                                    {
                                                        id: '54',
                                                        tag: 'INNTEKTSKILDE_SELVSTENDIG_ER_DU_SYKMELDT',
                                                        sporsmalstekst: 'Er du sykmeldt fra dette?',
                                                        undertekst: null,
                                                        svartype: SoknadSporsmalSvartypeEnum.JaNei,
                                                        min: null,
                                                        max: null,
                                                        kriterieForVisningAvUndersporsmal: null,
                                                        svar: [{ verdi: 'NEI' }],
                                                        undersporsmal: [],
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    })}
                />,
            );

            expect(
                screen.getByRole('listitem', {
                    name: 'Har du hatt inntekt mens du har vært sykmeldt i perioden 27. mai - 11. juni 2020?',
                }),
            ).toBeInTheDocument();

            expect(screen.getByRole('listitem', { name: 'Hvilke inntektskilder har du hatt?' })).toBeInTheDocument();

            const sykmeldtFraDetteListItems = screen.getAllByRole('listitem', { name: 'Er du sykmeldt fra dette?' });
            expect(sykmeldtFraDetteListItems).toHaveLength(2);

            expect(screen.getByText('andre arbeidsforhold')).toBeInTheDocument();
            expect(sykmeldtFraDetteListItems[0]).toHaveTextContent('Ja');

            expect(screen.getByText('selvstendig næringsdrivende')).toBeInTheDocument();
            expect(sykmeldtFraDetteListItems[1]).toHaveTextContent('Nei');
        });

        it('Should show sporsmal for Dato if svar exists', () => {
            render(
                <SoknadPanel
                    soknad={createSoknad({
                        sporsmal: [
                            {
                                id: '687342',
                                tag: 'TILBAKE_NAR',
                                sporsmalstekst: 'Når begynte du å jobbe igjen?',
                                undertekst: null,
                                svartype: SoknadSporsmalSvartypeEnum.Dato,
                                min: '2020-04-01',
                                max: '2020-04-24',
                                kriterieForVisningAvUndersporsmal: null,
                                svar: [{ verdi: '2020-04-01' }],
                                undersporsmal: [],
                            },
                        ],
                    })}
                />,
            );

            expect(screen.getByRole('listitem', { name: 'Når begynte du å jobbe igjen?' })).toBeInTheDocument();
            expect(screen.getByText('1. april 2020')).toBeInTheDocument();
        });

        it('Should show sporsmal for Fritekst if svar exists', () => {
            render(
                <SoknadPanel
                    soknad={createSoknad({
                        sporsmal: [
                            {
                                id: '687342',
                                tag: 'TILBAKE_NAR',
                                sporsmalstekst: 'Er dette et spørsmål?',
                                undertekst: null,
                                svartype: SoknadSporsmalSvartypeEnum.Fritekst,
                                min: null,
                                max: null,
                                kriterieForVisningAvUndersporsmal: null,
                                svar: [{ verdi: 'Dette er et svar.' }],
                                undersporsmal: [],
                            },
                        ],
                    })}
                />,
            );

            expect(screen.getByRole('listitem', { name: 'Er dette et spørsmål?' })).toBeInTheDocument();
            expect(screen.getByText('Dette er et svar.')).toBeInTheDocument();
        });

        it('Should show sporsmal for Land if svar exists', () => {
            render(
                <SoknadPanel
                    soknad={createSoknad({
                        sporsmal: [
                            {
                                id: '687342',
                                tag: 'LAND',
                                sporsmalstekst: 'Hvilket land?',
                                undertekst: null,
                                svartype: SoknadSporsmalSvartypeEnum.Land,
                                min: '2020-04-01',
                                max: '2020-04-24',
                                kriterieForVisningAvUndersporsmal: null,
                                svar: [{ verdi: 'Norge' }, { verdi: 'Danmark' }, { verdi: 'Sverige' }],
                                undersporsmal: [],
                            },
                        ],
                    })}
                />,
            );

            expect(screen.getByRole('listitem', { name: 'Hvilket land?' })).toBeInTheDocument();
            expect(screen.getByText('Norge')).toBeInTheDocument();
            expect(screen.getByText('Danmark')).toBeInTheDocument();
            expect(screen.getByText('Sverige')).toBeInTheDocument();
        });

        it('Should not show sporsmal for Land if svar is missing', () => {
            render(
                <SoknadPanel
                    soknad={createSoknad({
                        sporsmal: [
                            {
                                id: '687342',
                                tag: 'LAND',
                                sporsmalstekst: 'Hvilket land?',
                                undertekst: null,
                                svartype: SoknadSporsmalSvartypeEnum.Land,
                                min: '2020-04-01',
                                max: '2020-04-24',
                                kriterieForVisningAvUndersporsmal: null,
                                svar: [],
                                undersporsmal: [],
                            },
                        ],
                    })}
                />,
            );

            expect(screen.queryByRole('listitem', { name: 'Hvilket land?' })).not.toBeInTheDocument();
        });

        it('Should show sporsmal for Undertekst if undertekst exists', () => {
            render(
                <SoknadPanel
                    soknad={createSoknad({
                        sporsmal: [
                            {
                                id: '6',
                                tag: '',
                                sporsmalstekst: 'Før du reiser ber vi deg bekrefte:',
                                undertekst:
                                    '<ul>\n    <li>Jeg har avklart med legen at reisen ikke vil forlenge sykefraværet</li>\n    <li>Reisen hindrer ikke planlagt behandling eller avtaler med NAV</li>\n</ul>',
                                svartype: SoknadSporsmalSvartypeEnum.IkkeRelevant,
                                min: null,
                                max: null,
                                kriterieForVisningAvUndersporsmal: null,
                                svar: [],
                                undersporsmal: [],
                            },
                        ],
                    })}
                />,
            );

            expect(screen.getByRole('listitem', { name: 'Før du reiser ber vi deg bekrefte:' })).toBeInTheDocument();
            expect(
                screen.getByText('Jeg har avklart med legen at reisen ikke vil forlenge sykefraværet'),
            ).toBeInTheDocument();
        });

        it('Should show sporsmal for RadioGruppe og Tall if svar exists in undersporsmal', () => {
            render(
                <SoknadPanel
                    soknad={createSoknad({
                        sporsmal: [
                            {
                                id: '106',
                                tag: 'HVOR_MYE_HAR_DU_JOBBET_0',
                                sporsmalstekst:
                                    'Hvor mye jobbet du totalt 20. mai - 5. juni 2020 hos 995816598 sitt orgnavn?',
                                undertekst: null,
                                svartype: SoknadSporsmalSvartypeEnum.RadioGruppeTimerProsent,
                                min: null,
                                max: null,
                                kriterieForVisningAvUndersporsmal: null,
                                svar: [],
                                undersporsmal: [
                                    {
                                        id: '107',
                                        tag: 'HVOR_MYE_PROSENT_0',
                                        sporsmalstekst: 'prosent',
                                        undertekst: null,
                                        svartype: SoknadSporsmalSvartypeEnum.Radio,
                                        min: null,
                                        max: null,
                                        kriterieForVisningAvUndersporsmal: SoknadSporsmalKriterierEnum.Checked,
                                        svar: [
                                            {
                                                verdi: 'CHECKED',
                                            },
                                        ],
                                        undersporsmal: [
                                            {
                                                id: '108',
                                                tag: 'HVOR_MYE_PROSENT_VERDI_0',
                                                sporsmalstekst: '',
                                                undertekst: 'prosent',
                                                svartype: SoknadSporsmalSvartypeEnum.Tall,
                                                min: '21',
                                                max: '99',
                                                kriterieForVisningAvUndersporsmal: null,
                                                svar: [
                                                    {
                                                        verdi: '10',
                                                    },
                                                ],
                                                undersporsmal: [],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    })}
                />,
            );

            expect(
                screen.getByRole('listitem', {
                    name: 'Hvor mye jobbet du totalt 20. mai - 5. juni 2020 hos 995816598 sitt orgnavn?',
                }),
            ).toBeInTheDocument();
            expect(screen.getByRole('listitem', { name: '10 prosent' })).toBeInTheDocument();
        });

        it('Should not show sporsmal with tag VAER_KLAR_OVER_AT', () => {
            render(
                <SoknadPanel
                    soknad={createSoknad({
                        sporsmal: [
                            {
                                id: '74',
                                tag: 'VAER_KLAR_OVER_AT',
                                sporsmalstekst: 'Viktig å være klar over:',
                                undertekst:
                                    '<ul><li>Du kan bare få sykepenger hvis det er din egen sykdom eller skade som hindrer deg i å jobbe. Sosiale eller økonomiske problemer gir ikke rett til sykepenger.</li><li>Du kan miste retten til sykepenger hvis du nekter å opplyse om din egen arbeidsevne, eller hvis du ikke tar imot behandling eller tilrettelegging.</li><li>Retten til sykepenger gjelder bare inntekt du har mottatt som lønn og betalt skatt av på sykmeldingstidspunktet.</li><li>NAV kan innhente opplysninger som er nødvendige for å behandle søknaden.</li><li>Du må melde fra til NAV hvis du satt i varetekt, sonet straff eller var under forvaring i sykmeldingsperioden.</li><li>Fristen for å søke sykepenger er som hovedregel 3 måneder</li></ul><p>Du kan lese mer om rettigheter og plikter på <a href="https://www.nav.no/sykepenger" target="_blank">nav.no/sykepenger</a>.</p>',
                                svartype: SoknadSporsmalSvartypeEnum.IkkeRelevant,
                                min: null,
                                max: null,
                                kriterieForVisningAvUndersporsmal: null,
                                svar: [],
                                undersporsmal: [],
                            },
                        ],
                    })}
                />,
            );
            expect(screen.queryByRole('listitem', { name: 'Viktig å være klar over:' })).not.toBeInTheDocument();
        });
    });
});
