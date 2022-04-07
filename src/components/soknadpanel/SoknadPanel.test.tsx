import { render, screen } from '../../utils/test/testUtils';
import { createSoknad } from '../../utils/test/dataCreators';
import {
    SoknadSporsmalKriterierEnum,
    SporsmalTagEnum,
    SoknadSporsmalSvartypeEnum,
} from '../../graphql/queries/graphql.generated';

import SoknadPanel from './SoknadPanel';
import { PossibleSvarEnum } from './SporsmalVarianter/SporsmalVarianter';

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
                                __typename: 'SoknadSporsmal',
                                id: '687375',
                                tag: SporsmalTagEnum.EnkeltstaendeBehandlingsdager,
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
                                        __typename: 'SoknadSporsmal',
                                        id: '687376',
                                        tag: SporsmalTagEnum.EnkeltstaendeBehandlingsdagerUke,
                                        sporsmalstekst: '2020-03-31 - 2020-04-03',
                                        undertekst: null,
                                        svartype: SoknadSporsmalSvartypeEnum.RadioGruppeUkekalender,
                                        min: '2020-03-31',
                                        max: '2020-04-03',
                                        kriterieForVisningAvUndersporsmal: null,
                                        svar: [{ __typename: 'SoknadSporsmalSvar', verdi: '' }],
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
                                __typename: 'SoknadSporsmal',
                                id: '1566424',
                                tag: SporsmalTagEnum.TransportTilDaglig,
                                sporsmalstekst:
                                    'Brukte du bil eller offentlig transport til og fra jobben før du ble sykmeldt?',
                                undertekst: null,
                                svartype: SoknadSporsmalSvartypeEnum.JaNei,
                                min: null,
                                max: null,
                                kriterieForVisningAvUndersporsmal: SoknadSporsmalKriterierEnum.Ja,
                                svar: [{ __typename: 'SoknadSporsmalSvar', verdi: PossibleSvarEnum.JA }],
                                undersporsmal: [
                                    {
                                        __typename: 'SoknadSporsmal',
                                        id: '1566425',
                                        tag: SporsmalTagEnum.TypeTransport,
                                        sporsmalstekst: 'Hva slags type transport brukte du?',
                                        undertekst: null,
                                        svartype: SoknadSporsmalSvartypeEnum.CheckboxGruppe,
                                        min: null,
                                        max: null,
                                        kriterieForVisningAvUndersporsmal: null,
                                        svar: [],
                                        undersporsmal: [
                                            {
                                                __typename: 'SoknadSporsmal',
                                                id: '1566426',
                                                tag: SporsmalTagEnum.OffentligTransportTilDaglig,
                                                sporsmalstekst: 'Offentlig transport',
                                                undertekst: null,
                                                svartype: SoknadSporsmalSvartypeEnum.Checkbox,
                                                min: null,
                                                max: null,
                                                kriterieForVisningAvUndersporsmal: SoknadSporsmalKriterierEnum.Checked,
                                                svar: [
                                                    {
                                                        __typename: 'SoknadSporsmalSvar',
                                                        verdi: PossibleSvarEnum.CHECKED,
                                                    },
                                                ],
                                                undersporsmal: [
                                                    {
                                                        __typename: 'SoknadSporsmal',
                                                        id: '1566427',
                                                        tag: SporsmalTagEnum.OffentligTransportBelop,
                                                        sporsmalstekst:
                                                            'Hvor mye betaler du vanligvis i måneden for offentlig transport?',
                                                        undertekst: '',
                                                        svartype: SoknadSporsmalSvartypeEnum.Belop,
                                                        min: '0',
                                                        max: null,
                                                        kriterieForVisningAvUndersporsmal: null,
                                                        svar: [
                                                            {
                                                                __typename: 'SoknadSporsmalSvar',
                                                                verdi: '85200',
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
            expect(screen.getByRole('listitem', { name: '852 kr' })).toBeInTheDocument();
        });

        it('Should show sporsmal for CheckboxGruppe if undersporsmal exists', () => {
            render(
                <SoknadPanel
                    soknad={createSoknad({
                        sporsmal: [
                            {
                                __typename: 'SoknadSporsmal',
                                id: '49',
                                tag: SporsmalTagEnum.AndreInntektskilder,
                                sporsmalstekst:
                                    'Har du hatt inntekt mens du har vært sykmeldt i perioden 27. mai - 11. juni 2020?',
                                undertekst: null,
                                svartype: SoknadSporsmalSvartypeEnum.JaNei,
                                min: null,
                                max: null,
                                kriterieForVisningAvUndersporsmal: SoknadSporsmalKriterierEnum.Ja,
                                svar: [{ __typename: 'SoknadSporsmalSvar', verdi: PossibleSvarEnum.JA }],
                                undersporsmal: [
                                    {
                                        __typename: 'SoknadSporsmal',
                                        id: '50',
                                        tag: SporsmalTagEnum.HvilkeAndreInntektskilder,
                                        sporsmalstekst: 'Hvilke inntektskilder har du hatt?',
                                        undertekst: null,
                                        svartype: SoknadSporsmalSvartypeEnum.CheckboxGruppe,
                                        min: null,
                                        max: null,
                                        kriterieForVisningAvUndersporsmal: null,
                                        svar: [],
                                        undersporsmal: [
                                            {
                                                __typename: 'SoknadSporsmal',
                                                id: '51',
                                                tag: SporsmalTagEnum.InntektskildeAndreArbeidsforhold,
                                                sporsmalstekst: 'andre arbeidsforhold',
                                                undertekst: null,
                                                svartype: SoknadSporsmalSvartypeEnum.Checkbox,
                                                min: null,
                                                max: null,
                                                kriterieForVisningAvUndersporsmal: SoknadSporsmalKriterierEnum.Checked,
                                                svar: [
                                                    {
                                                        __typename: 'SoknadSporsmalSvar',
                                                        verdi: PossibleSvarEnum.CHECKED,
                                                    },
                                                ],
                                                undersporsmal: [
                                                    {
                                                        __typename: 'SoknadSporsmal',
                                                        id: '52',
                                                        tag: SporsmalTagEnum.InntektskildeAndreArbeidsforholdErDuSykmeldt,
                                                        sporsmalstekst: 'Er du sykmeldt fra dette?',
                                                        undertekst: null,
                                                        svartype: SoknadSporsmalSvartypeEnum.JaNei,
                                                        min: null,
                                                        max: null,
                                                        kriterieForVisningAvUndersporsmal: null,
                                                        svar: [
                                                            {
                                                                __typename: 'SoknadSporsmalSvar',
                                                                verdi: PossibleSvarEnum.JA,
                                                            },
                                                        ],
                                                        undersporsmal: [],
                                                    },
                                                ],
                                            },
                                            {
                                                __typename: 'SoknadSporsmal',
                                                id: '53',
                                                tag: SporsmalTagEnum.InntektskildeSelvstendig,
                                                sporsmalstekst: 'selvstendig næringsdrivende',
                                                undertekst: null,
                                                svartype: SoknadSporsmalSvartypeEnum.Checkbox,
                                                min: null,
                                                max: null,
                                                kriterieForVisningAvUndersporsmal: SoknadSporsmalKriterierEnum.Checked,
                                                svar: [
                                                    {
                                                        __typename: 'SoknadSporsmalSvar',
                                                        verdi: PossibleSvarEnum.CHECKED,
                                                    },
                                                ],
                                                undersporsmal: [
                                                    {
                                                        __typename: 'SoknadSporsmal',
                                                        id: '54',
                                                        tag: SporsmalTagEnum.InntektskildeSelvstendigErDuSykmeldt,
                                                        sporsmalstekst: 'Er du sykmeldt fra dette?',
                                                        undertekst: null,
                                                        svartype: SoknadSporsmalSvartypeEnum.JaNei,
                                                        min: null,
                                                        max: null,
                                                        kriterieForVisningAvUndersporsmal: null,
                                                        svar: [
                                                            {
                                                                __typename: 'SoknadSporsmalSvar',
                                                                verdi: PossibleSvarEnum.NEI,
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
                                __typename: 'SoknadSporsmal',
                                id: '687342',
                                tag: SporsmalTagEnum.TilbakeNar,
                                sporsmalstekst: 'Når begynte du å jobbe igjen?',
                                undertekst: null,
                                svartype: SoknadSporsmalSvartypeEnum.Dato,
                                min: '2020-04-01',
                                max: '2020-04-24',
                                kriterieForVisningAvUndersporsmal: null,
                                svar: [{ __typename: 'SoknadSporsmalSvar', verdi: '2020-04-01' }],
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
                                __typename: 'SoknadSporsmal',
                                id: '687342',
                                tag: SporsmalTagEnum.TilbakeNar,
                                sporsmalstekst: 'Er dette et spørsmål?',
                                undertekst: null,
                                svartype: SoknadSporsmalSvartypeEnum.Fritekst,
                                min: null,
                                max: null,
                                kriterieForVisningAvUndersporsmal: null,
                                svar: [{ __typename: 'SoknadSporsmalSvar', verdi: 'Dette er et svar.' }],
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
                                __typename: 'SoknadSporsmal',
                                id: '687342',
                                tag: SporsmalTagEnum.Land,
                                sporsmalstekst: 'Hvilket land?',
                                undertekst: null,
                                svartype: SoknadSporsmalSvartypeEnum.Land,
                                min: '2020-04-01',
                                max: '2020-04-24',
                                kriterieForVisningAvUndersporsmal: null,
                                svar: [
                                    { __typename: 'SoknadSporsmalSvar', verdi: 'Norge' },
                                    { __typename: 'SoknadSporsmalSvar', verdi: 'Danmark' },
                                    { __typename: 'SoknadSporsmalSvar', verdi: 'Sverige' },
                                ],
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
                                __typename: 'SoknadSporsmal',
                                id: '687342',
                                tag: SporsmalTagEnum.Land,
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
                                __typename: 'SoknadSporsmal',
                                id: '6',
                                tag: SporsmalTagEnum.BekreftOpplysningerUtland,
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
                                __typename: 'SoknadSporsmal',
                                id: '106',
                                tag: SporsmalTagEnum.HvorMyeHarDuJobbet,
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
                                        __typename: 'SoknadSporsmal',
                                        id: '107',
                                        tag: SporsmalTagEnum.HvorMyeProsent,
                                        sporsmalstekst: 'prosent',
                                        undertekst: null,
                                        svartype: SoknadSporsmalSvartypeEnum.Radio,
                                        min: null,
                                        max: null,
                                        kriterieForVisningAvUndersporsmal: SoknadSporsmalKriterierEnum.Checked,
                                        svar: [
                                            {
                                                __typename: 'SoknadSporsmalSvar',
                                                verdi: PossibleSvarEnum.CHECKED,
                                            },
                                        ],
                                        undersporsmal: [
                                            {
                                                __typename: 'SoknadSporsmal',
                                                id: '108',
                                                tag: SporsmalTagEnum.HvorMyeProsentVerdi,
                                                sporsmalstekst: '',
                                                undertekst: 'prosent',
                                                svartype: SoknadSporsmalSvartypeEnum.Tall,
                                                min: '21',
                                                max: '99',
                                                kriterieForVisningAvUndersporsmal: null,
                                                svar: [
                                                    {
                                                        __typename: 'SoknadSporsmalSvar',
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
        it('Should show sporsmal for Kvittering with 1 svar', () => {
            render(
                <SoknadPanel
                    soknad={createSoknad({
                        sporsmal: [
                            {
                                __typename: 'SoknadSporsmal',
                                id: '687375',
                                tag: SporsmalTagEnum.Kvitteringer,
                                sporsmalstekst: 'Kvitteringer for reiseutgifter til jobben fra 1. - 24. mai 2020.',
                                undertekst: null,
                                svartype: SoknadSporsmalSvartypeEnum.Kvittering,
                                min: null,
                                max: null,
                                kriterieForVisningAvUndersporsmal: null,
                                svar: [
                                    {
                                        __typename: 'SoknadSporsmalSvar',
                                        verdi: `{"blobId": "9a186e3c-aeeb-4566-a865-15aa9139d364","belop": 133700,"typeUtgift": "OFFENTLIG_TRANSPORT", "opprettet": ""}`,
                                    },
                                ],
                                undersporsmal: [],
                            },
                        ],
                    })}
                />,
            );

            expect(
                screen.getByRole('listitem', {
                    name: 'Kvitteringer for reiseutgifter til jobben fra 1. - 24. mai 2020.',
                }),
            ).toBeInTheDocument();
            expect(screen.getByText('Du lastet opp 1 utgift på 1337 kr')).toBeInTheDocument();
        });
        it('Should show sporsmal for Kvittering with 3 svar', () => {
            render(
                <SoknadPanel
                    soknad={createSoknad({
                        sporsmal: [
                            {
                                __typename: 'SoknadSporsmal',
                                id: '687375',
                                tag: SporsmalTagEnum.Kvitteringer,
                                sporsmalstekst: 'Kvitteringer for reiseutgifter til jobben fra 16. - 18. mai 2021.',
                                undertekst: null,
                                svartype: SoknadSporsmalSvartypeEnum.Kvittering,
                                min: null,
                                max: null,
                                kriterieForVisningAvUndersporsmal: null,
                                svar: [
                                    {
                                        __typename: 'SoknadSporsmalSvar',
                                        verdi: `{"blobId": "43215544","belop": 64500,"typeUtgift": "TAXI", "opprettet": ""}`,
                                    },
                                    {
                                        __typename: 'SoknadSporsmalSvar',
                                        verdi: `{"blobId": "54316324","belop": 23200,"typeUtgift": "PARKERING", "opprettet": ""}`,
                                    },
                                    {
                                        __typename: 'SoknadSporsmalSvar',
                                        verdi: `{"blobId": "54135135","belop": 72400,"typeUtgift": "ANNET", "opprettet": ""}`,
                                    },
                                ],
                                undersporsmal: [],
                            },
                        ],
                    })}
                />,
            );

            expect(
                screen.getByRole('listitem', {
                    name: 'Kvitteringer for reiseutgifter til jobben fra 16. - 18. mai 2021.',
                }),
            ).toBeInTheDocument();
            expect(screen.getByText('Du lastet opp 3 utgifter på til sammen 1601 kr')).toBeInTheDocument();
        });

        it('should show birthday not fnr', () => {
            const fnr = '94117834023';

            render(
                <SoknadPanel
                    soknad={createSoknad({
                        fnr: fnr,
                    })}
                />,
            );
            expect(screen.getByRole('listitem', { name: 'Søknaden er sendt inn av' })).toHaveTextContent('941178');
            expect(screen.getByRole('listitem', { name: 'Søknaden er sendt inn av' })).not.toHaveTextContent('9411783');
            expect(screen.getByRole('listitem', { name: 'Søknaden er sendt inn av' })).not.toHaveTextContent(fnr);
        });
    });
});
