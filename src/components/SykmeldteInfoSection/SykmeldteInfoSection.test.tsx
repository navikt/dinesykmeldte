import type { MockLink } from "@apollo/client/testing";
import { act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  MineSykmeldteDocument,
  VirksomheterDocument,
} from "../../graphql/queries/graphql.generated";
import { DIALOGMOTE_TILTAKSPAKKE_2 } from "../../services/tiltakspakke/tiltakspakkevurderingContract";
import filterSlice from "../../state/filterSlice";
import {
  createInitialQuery,
  createPreviewSykmeldt,
  createVirksomhet,
} from "../../utils/test/dataCreators";
import { createTestStore, render, screen } from "../../utils/test/testUtils";
import SykmeldteInfoSection from "./SykmeldteInfoSection";

const TILTAKSGRUPPE_ORGNUMMER = "123456789";
const ANNET_ORGNUMMER = "987654321";

const VIRKSOMHETER = [
  createVirksomhet({
    navn: "Stor & Syk AS",
    orgnummer: TILTAKSGRUPPE_ORGNUMMER,
  }),
  createVirksomhet({
    navn: "Annen virksomhet",
    orgnummer: ANNET_ORGNUMMER,
  }),
];

const KOM_I_GANG_HEADING = "Kom i gang tidlig når en ansatt er sykmeldt";
const KOM_I_GANG_BRODTEKST =
  "Å ta den første samtalen tidlig viser at du er der. Å ha kontakt helt fra start og følge opp underveis kan gjøre det enklere for den som er sykmeldt å komme tilbake til jobb, at risiko for langvarig sykefravær reduseres.";
const STEGOVERSIKT_HEADING = "De første ukene av sykefraværet";
const TOM_LISTE_TEKST =
  "Hei, ingen av de medarbeiderene du er registrert som leder for har aktive sykmeldinger, og derfor vises de ikke her";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SykmeldteInfoSection", () => {
  it("viser stegoversikten for tiltaksgruppen i tiltakspakke 2", async () => {
    mockTiltakspakkevurdering(tiltakspakke2Vurdering());

    renderPanel({
      valgtVirksomhet: TILTAKSGRUPPE_ORGNUMMER,
    });

    await ventPaaStegoversikt();
    forventKunStegoversikt();
  });

  it("viser stegoversikten ved «Alle virksomheter» når minst én virksomhet er i tiltaksgruppen", async () => {
    mockTiltakspakkevurdering(tiltakspakke2Vurdering());

    renderPanel();

    await ventPaaStegoversikt();
    forventKunStegoversikt();
  });

  it("viser ingen boks før vurderingen er ferdig, og deretter stegoversikten", async () => {
    const utsattVurdering = mockUtsattTiltakspakkevurdering();

    renderPanel({
      valgtVirksomhet: TILTAKSGRUPPE_ORGNUMMER,
    });
    await settleRender();

    expect(utsattVurdering.fetchMock).toHaveBeenCalledTimes(1);
    forventIngenAvBoksene();

    await utsattVurdering.svarMed(tiltakspakke2Vurdering());

    await ventPaaStegoversikt();
    forventKunStegoversikt();
  });

  it("viser ingen boks før vurderingen er ferdig, og deretter «Kom i gang» når ingen virksomhet er i tiltaksgruppen", async () => {
    const utsattVurdering = mockUtsattTiltakspakkevurdering();

    renderPanel({
      valgtVirksomhet: TILTAKSGRUPPE_ORGNUMMER,
    });
    await settleRender();

    forventIngenAvBoksene();

    await utsattVurdering.svarMed(kontrollgruppeVurdering());

    await ventPaaKomIGangBoks();
    forventKunKomIGangBoks();
  });

  it("viser ingen boks mens virksomhetene lastes, og deretter stegoversikten", async () => {
    mockTiltakspakkevurdering(tiltakspakke2Vurdering());

    renderPanel({
      virksomheterLastesFortsatt: true,
    });
    await settleRender();

    forventIngenAvBoksene();

    await ventPaaStegoversikt();
    forventKunStegoversikt();
  });

  it("viser «Kom i gang» når tiltakspakke-hentingen feiler", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));

    renderPanel({
      valgtVirksomhet: TILTAKSGRUPPE_ORGNUMMER,
    });

    await ventPaaKomIGangBoks();
    forventKunKomIGangBoks();
  });

  it("beholder stegoversikten når brukeren velger en virksomhet i kontrollgruppen, uten ny henting", async () => {
    const fetchMock = mockTiltakspakkevurdering(tiltakspakke2Vurdering());

    const store = createTestStore();
    renderPanel({
      store,
      valgtVirksomhet: TILTAKSGRUPPE_ORGNUMMER,
    });

    await ventPaaStegoversikt();

    velgVirksomhet(store, ANNET_ORGNUMMER);
    forventKunStegoversikt();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("beholder overskriftsnivå og landmark-semantikk på «Kom i gang»-boksen", async () => {
    renderPanel();

    const overskrift = await ventPaaKomIGangBoks();
    expect(overskrift.tagName).toBe("H2");
    expect(
      screen.getByRole("region", { name: KOM_I_GANG_HEADING }),
    ).toBeInTheDocument();
    expect(screen.getByText(KOM_I_GANG_BRODTEKST)).toBeInTheDocument();
  });

  it("viser tomtilstanden uten å vente på tiltakspakkevurderingen", async () => {
    mockUtsattTiltakspakkevurdering();

    renderPanel({
      valgtVirksomhet: TILTAKSGRUPPE_ORGNUMMER,
      sykmeldte: [],
    });

    expect(await screen.findByText(TOM_LISTE_TEKST)).toBeInTheDocument();
    forventIngenAvBoksene();
  });
});

async function ventPaaKomIGangBoks(): Promise<HTMLElement> {
  return screen.findByRole("heading", { name: KOM_I_GANG_HEADING });
}

async function ventPaaStegoversikt(): Promise<HTMLElement> {
  return screen.findByRole("heading", { name: STEGOVERSIKT_HEADING });
}

/**
 * Stegoversikten og «Kom i gang» skal aldri stå samtidig. Hver forventning
 * sjekker derfor både at riktig boks finnes og at den andre er borte.
 */
function forventKunKomIGangBoks(): void {
  expect(
    screen.getByRole("heading", { name: KOM_I_GANG_HEADING }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("heading", { name: STEGOVERSIKT_HEADING }),
  ).not.toBeInTheDocument();
}

function forventKunStegoversikt(): void {
  expect(
    screen.getByRole("heading", { name: STEGOVERSIKT_HEADING }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("heading", { name: KOM_I_GANG_HEADING }),
  ).not.toBeInTheDocument();
}

function forventIngenAvBoksene(): void {
  expect(
    screen.queryByRole("heading", { name: KOM_I_GANG_HEADING }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("heading", { name: STEGOVERSIKT_HEADING }),
  ).not.toBeInTheDocument();
}

/**
 * Lar alle allerede oppfylte løfter kjøre ferdig, slik at «ingen boks» måles på
 * en satt mellomtilstand og ikke bare på at React ikke har rukket å rendre.
 * Utsatte kilder (uløst fetch, forsinket Apollo-mock) står fortsatt og venter.
 */
async function settleRender(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
  });
}

function velgVirksomhet(
  store: ReturnType<typeof createTestStore>,
  orgnummer: string,
): void {
  act(() => {
    store.dispatch(filterSlice.actions.setVirksomhet(orgnummer));
  });
}

function renderPanel({
  store,
  valgtVirksomhet,
  virksomheterLastesFortsatt = false,
  sykmeldte = [
    createPreviewSykmeldt({ fnr: "1", orgnummer: TILTAKSGRUPPE_ORGNUMMER }),
  ],
}: {
  readonly store?: ReturnType<typeof createTestStore>;
  readonly valgtVirksomhet?: string;
  /**
   * Legger virksomhetene bak et forsinket nettverkssvar i stedet for i cachen,
   * slik at `VirksomheterDocument` faktisk er i lastetilstand ved første
   * render. Svaret er identisk, så testene ser samme virksomheter etterpå.
   */
  readonly virksomheterLastesFortsatt?: boolean;
  readonly sykmeldte?: ReturnType<typeof createPreviewSykmeldt>[];
} = {}): void {
  const reduxStore = store ?? createTestStore();
  if (valgtVirksomhet != null) {
    reduxStore.dispatch(filterSlice.actions.setVirksomhet(valgtVirksomhet));
  }

  const virksomheterInitialState = createInitialQuery(VirksomheterDocument, {
    __typename: "Query",
    virksomheter: VIRKSOMHETER,
  });

  const virksomheterMock: MockLink.MockedResponse = {
    request: { query: VirksomheterDocument },
    result: { data: { virksomheter: VIRKSOMHETER } },
    delay: 20,
  };

  render(<SykmeldteInfoSection />, {
    store: reduxStore,
    mocks: virksomheterLastesFortsatt ? [virksomheterMock] : [],
    initialState: [
      createInitialQuery(MineSykmeldteDocument, {
        __typename: "Query",
        mineSykmeldte: sykmeldte,
      }),
      ...(virksomheterLastesFortsatt ? [] : [virksomheterInitialState]),
    ],
  });
}

function tiltakspakke2Vurdering(): unknown[] {
  return [
    {
      tiltakspakkeId: DIALOGMOTE_TILTAKSPAKKE_2,
      virksomheter: [
        { orgnummer: TILTAKSGRUPPE_ORGNUMMER, deltakelse: "TILTAKSGRUPPE" },
        { orgnummer: ANNET_ORGNUMMER, deltakelse: "KONTROLLGRUPPE" },
      ],
    },
  ];
}

function kontrollgruppeVurdering(): unknown[] {
  return [
    {
      tiltakspakkeId: DIALOGMOTE_TILTAKSPAKKE_2,
      virksomheter: [
        { orgnummer: TILTAKSGRUPPE_ORGNUMMER, deltakelse: "KONTROLLGRUPPE" },
        { orgnummer: ANNET_ORGNUMMER, deltakelse: "KONTROLLGRUPPE" },
      ],
    },
  ];
}

function mockTiltakspakkevurdering(body: unknown): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn();
  fetchMock.mockResolvedValue(
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}

/**
 * Tiltakspakke-kall som står og venter til testen selv svarer. Lar oss måle
 * mellomtilstanden før svaret, og løftet blir alltid løst av `svarMed`, så
 * ingen promise henger igjen etter testen.
 */
function mockUtsattTiltakspakkevurdering(): {
  readonly fetchMock: ReturnType<typeof vi.fn>;
  readonly svarMed: (body: unknown) => Promise<void>;
} {
  let løsKallet: (body: unknown) => void = () => {};
  const respons = new Promise<Response>((resolve) => {
    løsKallet = (body) => {
      resolve(
        new Response(JSON.stringify(body), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    };
  });

  const fetchMock = vi.fn();
  fetchMock.mockReturnValue(respons);
  vi.stubGlobal("fetch", fetchMock);

  return {
    fetchMock,
    svarMed: async (body: unknown) => {
      await act(async () => {
        løsKallet(body);
        await respons;
      });
    },
  };
}
