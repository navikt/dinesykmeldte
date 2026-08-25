import type { MockedResponse } from "@apollo/client/testing";
import { act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  MineSykmeldteDocument,
  VirksomheterDocument,
} from "../../graphql/queries/graphql.generated";
import { OPPFOLGINGSPLAN_TILTAKSPAKKE_1 } from "../../services/tiltakspakke/tiltakspakkevurderingContract";
import filterSlice from "../../state/filterSlice";
import {
  createInitialQuery,
  createPreviewSykmeldt,
  createVirksomhet,
} from "../../utils/test/dataCreators";
import { createTestStore, render, screen } from "../../utils/test/testUtils";
import SykmeldteInfoPanel from "./SykmeldteInfoPanel";

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
const PERSONALANSVAR_TEKST =
  "Hei, vi har fått vite at du har personalansvar for noen som er sykmeldt i denne virksomheten.";
const TOM_LISTE_TEKST =
  "Hei, ingen av de medarbeiderene du er registrert som leder for har aktive sykmeldinger, og derfor vises de ikke her";

beforeEach(() => {
  window.localStorage.clear();
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SykmeldteInfoPanel", () => {
  describe("«Kom i gang tidlig» erstatter personalansvarsboksen", () => {
    it("viser «Kom i gang» i stedet for personalansvar når valgt virksomhet er i tiltaksgruppen", async () => {
      mockTiltakspakkevurdering(blandetVurdering());

      renderPanel({ valgtVirksomhet: TILTAKSGRUPPE_ORGNUMMER });

      await ventPaaKomIGangBoks();
      forventKunKomIGangBoks();
    });

    it("viser «Kom i gang» ved «Alle virksomheter» når minst én virksomhet er i tiltaksgruppen", async () => {
      // Avklart domeneregel: det er akseptert at brukeren samtidig har
      // virksomheter i kontrollgruppen når «Alle virksomheter» er valgt.
      mockTiltakspakkevurdering(blandetVurdering());

      renderPanel();

      await ventPaaKomIGangBoks();
      forventKunKomIGangBoks();
    });

    it("beholder overskriftsnivå og landmark-semantikk på «Kom i gang»-boksen", async () => {
      mockTiltakspakkevurdering(blandetVurdering());

      renderPanel({ valgtVirksomhet: TILTAKSGRUPPE_ORGNUMMER });

      const overskrift = await ventPaaKomIGangBoks();
      expect(overskrift.tagName).toBe("H2");
      expect(
        screen.getByRole("region", { name: KOM_I_GANG_HEADING }),
      ).toBeInTheDocument();
      expect(screen.getByText(KOM_I_GANG_BRODTEKST)).toBeInTheDocument();
    });
  });

  describe("personalansvarsboksen beholdes utenfor tiltaksgruppen", () => {
    it.each([
      {
        name: "KONTROLLGRUPPE",
        deltakelse: "KONTROLLGRUPPE",
      },
      {
        name: "UTENFOR_SCOPE",
        deltakelse: "UTENFOR_SCOPE",
      },
      {
        name: "ukjent deltakelse",
        deltakelse: "UKJENT",
      },
    ])("viser personalansvar og ikke «Kom i gang» ved $name", async ({
      deltakelse,
    }) => {
      mockTiltakspakkevurdering([
        {
          tiltakspakkeId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
          virksomheter: [{ orgnummer: TILTAKSGRUPPE_ORGNUMMER, deltakelse }],
        },
      ]);

      renderPanel({ valgtVirksomhet: TILTAKSGRUPPE_ORGNUMMER });

      await ventPaaPersonalansvarsboks();
      forventKunPersonalansvarsboks();
    });

    it("viser personalansvar når valgt virksomhet mangler i vurderingen", async () => {
      mockTiltakspakkevurdering(blandetVurdering());

      renderPanel({ valgtVirksomhet: ANNET_ORGNUMMER });

      await ventPaaPersonalansvarsboks();
      forventKunPersonalansvarsboks();
    });

    it("viser personalansvar ved «Alle virksomheter» når ingen virksomheter er i tiltaksgruppen", async () => {
      mockTiltakspakkevurdering(kunKontrollgruppeVurdering());

      renderPanel();

      await ventPaaPersonalansvarsboks();
      forventKunPersonalansvarsboks();
    });

    it("viser personalansvar når tiltakspakkevurderingen mangler helt", async () => {
      mockTiltakspakkevurdering([]);

      renderPanel({ valgtVirksomhet: TILTAKSGRUPPE_ORGNUMMER });

      await ventPaaPersonalansvarsboks();
      forventKunPersonalansvarsboks();
    });

    it("viser personalansvar når tiltakspakke-hentingen feiler", async () => {
      const fetchMock = vi.fn();
      fetchMock.mockRejectedValue(new Error("network"));
      vi.stubGlobal("fetch", fetchMock);

      renderPanel({ valgtVirksomhet: TILTAKSGRUPPE_ORGNUMMER });

      await ventPaaPersonalansvarsboks();
      forventKunPersonalansvarsboks();
    });
  });

  /**
   * Invarianten boksene henger på: så lenge vurderingen er uavklart, skal
   * ingen av de to boksene vises. Vurderingen har to kilder som hver for seg
   * kan være underveis — tiltakspakke-kallet og virksomhetene — og begge er
   * testet, fordi de gates av hvert sitt uttrykk i
   * `useTiltaksgruppeForVirksomhetsvalg` (`erVurderingFerdig` fra react-query
   * og `virksomheterLoading` fra Apollo).
   */
  describe("mens vurderingen er uavklart", () => {
    it("viser ingen av boksene før tiltakspakke-svaret kommer, og deretter «Kom i gang»", async () => {
      const utsattVurdering = mockUtsattTiltakspakkevurdering();

      renderPanel({ valgtVirksomhet: TILTAKSGRUPPE_ORGNUMMER });
      await settleRender();

      // Kallet er faktisk i gang — dette er «venter på svar», ikke «ingen
      // virksomhetskontekst å vurdere».
      expect(utsattVurdering.fetchMock).toHaveBeenCalledTimes(1);
      forventIngenAvBoksene();

      await utsattVurdering.svarMed(blandetVurdering());

      await ventPaaKomIGangBoks();
      forventKunKomIGangBoks();
    });

    it("viser ingen av boksene før tiltakspakke-svaret kommer, og deretter personalansvar", async () => {
      const utsattVurdering = mockUtsattTiltakspakkevurdering();

      renderPanel({ valgtVirksomhet: ANNET_ORGNUMMER });
      await settleRender();

      expect(utsattVurdering.fetchMock).toHaveBeenCalledTimes(1);
      forventIngenAvBoksene();

      await utsattVurdering.svarMed(blandetVurdering());

      await ventPaaPersonalansvarsboks();
      forventKunPersonalansvarsboks();
    });

    it("viser ingen av boksene mens virksomhetene lastes, selv om vurderingen svarer «Kom i gang»", async () => {
      // «Alle virksomheter» er valgt, så virksomhetslisten er hele
      // vurderingskonteksten. Uten gating på virksomhetslastingen ville
      // konteksten vært tom, vurderingen svart nei, og personalansvarsboksen
      // rukket å vises før den ble byttet ut med «Kom i gang».
      mockTiltakspakkevurdering(blandetVurdering());

      renderPanel({ virksomheterLastesFortsatt: true });
      await settleRender();

      forventIngenAvBoksene();

      await ventPaaKomIGangBoks();
      forventKunKomIGangBoks();
    });

    it("viser ingen av boksene mens virksomhetene lastes, og deretter personalansvar", async () => {
      mockTiltakspakkevurdering(kunKontrollgruppeVurdering());

      renderPanel({ virksomheterLastesFortsatt: true });
      await settleRender();

      forventIngenAvBoksene();

      await ventPaaPersonalansvarsboks();
      forventKunPersonalansvarsboks();
    });
  });

  describe("bytte av virksomhet", () => {
    it("bytter fra «Kom i gang» til personalansvar når brukeren velger en kontrollvirksomhet", async () => {
      mockTiltakspakkevurdering(blandetVurdering());

      const store = createTestStore();
      renderPanel({ store, valgtVirksomhet: TILTAKSGRUPPE_ORGNUMMER });

      await ventPaaKomIGangBoks();
      forventKunKomIGangBoks();

      velgVirksomhet(store, ANNET_ORGNUMMER);

      // Vurderingen er allerede ferdig behandlet (boksen over var synlig), så
      // dette er en reell overgang og ikke bare «ikke lastet ennå».
      forventKunPersonalansvarsboks();
    });

    it("bytter fra personalansvar tilbake til «Kom i gang» når brukeren velger tiltaksvirksomheten", async () => {
      mockTiltakspakkevurdering(blandetVurdering());

      const store = createTestStore();
      renderPanel({ store, valgtVirksomhet: ANNET_ORGNUMMER });

      await ventPaaPersonalansvarsboks();
      forventKunPersonalansvarsboks();

      velgVirksomhet(store, TILTAKSGRUPPE_ORGNUMMER);

      forventKunKomIGangBoks();
    });

    it("bytter til «Kom i gang» når brukeren går fra kontrollvirksomhet til «Alle virksomheter»", async () => {
      mockTiltakspakkevurdering(blandetVurdering());

      const store = createTestStore();
      renderPanel({ store, valgtVirksomhet: ANNET_ORGNUMMER });

      await ventPaaPersonalansvarsboks();

      velgVirksomhet(store, "all");

      forventKunKomIGangBoks();
    });

    it("bytter tilbake til personalansvar når brukeren går fra «Alle virksomheter» til en kontrollvirksomhet", async () => {
      mockTiltakspakkevurdering(blandetVurdering());

      const store = createTestStore();
      renderPanel({ store });

      await ventPaaKomIGangBoks();

      velgVirksomhet(store, ANNET_ORGNUMMER);

      forventKunPersonalansvarsboks();
    });

    it("henter tiltakspakkevurderingen én gang selv om brukeren bytter virksomhet flere ganger", async () => {
      const fetchMock = mockTiltakspakkevurdering(blandetVurdering());

      const store = createTestStore();
      renderPanel({ store, valgtVirksomhet: TILTAKSGRUPPE_ORGNUMMER });

      await ventPaaKomIGangBoks();

      velgVirksomhet(store, ANNET_ORGNUMMER);
      velgVirksomhet(store, TILTAKSGRUPPE_ORGNUMMER);

      forventKunKomIGangBoks();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("dismiss-status på personalansvarsboksen", () => {
    it("respekterer at boksen allerede er lukket, uten å nullstille lagringen", async () => {
      mockTiltakspakkevurdering(blandetVurdering());

      const store = createTestStore();
      renderPanel({ store, valgtVirksomhet: ANNET_ORGNUMMER });

      await ventPaaPersonalansvarsboks();
      await userEvent.click(screen.getByRole("button", { name: "OK" }));
      expect(screen.queryByText(PERSONALANSVAR_TEKST)).not.toBeInTheDocument();

      velgVirksomhet(store, TILTAKSGRUPPE_ORGNUMMER);
      forventKunKomIGangBoks();

      velgVirksomhet(store, ANNET_ORGNUMMER);

      // Boksen er fortsatt lukket, og lagringen er ikke rørt av bytting.
      expect(screen.queryByText(PERSONALANSVAR_TEKST)).not.toBeInTheDocument();
      expect(screen.queryByRole("heading", { name: KOM_I_GANG_HEADING })).toBe(
        null,
      );
      expect(window.localStorage.getItem("personalansvar-info")).toBe("true");
    });
  });

  describe("uten aktive sykmeldte", () => {
    it("viser tomtilstanden, ikke «Kom i gang», selv i tiltaksgruppen", async () => {
      mockTiltakspakkevurdering(blandetVurdering());

      renderPanel({
        valgtVirksomhet: TILTAKSGRUPPE_ORGNUMMER,
        sykmeldte: [],
      });

      expect(await screen.findByText(TOM_LISTE_TEKST)).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: KOM_I_GANG_HEADING }),
      ).not.toBeInTheDocument();
      expect(screen.queryByText(PERSONALANSVAR_TEKST)).not.toBeInTheDocument();
    });
  });
});

async function ventPaaKomIGangBoks(): Promise<HTMLElement> {
  return screen.findByRole("heading", { name: KOM_I_GANG_HEADING });
}

async function ventPaaPersonalansvarsboks(): Promise<HTMLElement> {
  return screen.findByText(PERSONALANSVAR_TEKST);
}

/**
 * De to boksene skal aldri stå samtidig. Hver forventning sjekker derfor både
 * at riktig boks finnes og at den andre er borte.
 */
function forventKunKomIGangBoks(): void {
  expect(
    screen.getByRole("heading", { name: KOM_I_GANG_HEADING }),
  ).toBeInTheDocument();
  expect(screen.queryByText(PERSONALANSVAR_TEKST)).not.toBeInTheDocument();
}

function forventKunPersonalansvarsboks(): void {
  expect(screen.getByText(PERSONALANSVAR_TEKST)).toBeInTheDocument();
  expect(
    screen.queryByRole("heading", { name: KOM_I_GANG_HEADING }),
  ).not.toBeInTheDocument();
}

function forventIngenAvBoksene(): void {
  expect(
    screen.queryByRole("heading", { name: KOM_I_GANG_HEADING }),
  ).not.toBeInTheDocument();
  expect(screen.queryByText(PERSONALANSVAR_TEKST)).not.toBeInTheDocument();
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

  const virksomheterMock: MockedResponse = {
    request: { query: VirksomheterDocument },
    result: { data: { virksomheter: VIRKSOMHETER } },
    delay: 20,
  };

  render(<SykmeldteInfoPanel />, {
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

function blandetVurdering(): unknown {
  return [
    {
      tiltakspakkeId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
      virksomheter: [
        { orgnummer: TILTAKSGRUPPE_ORGNUMMER, deltakelse: "TILTAKSGRUPPE" },
        { orgnummer: ANNET_ORGNUMMER, deltakelse: "KONTROLLGRUPPE" },
      ],
    },
  ];
}

function kunKontrollgruppeVurdering(): unknown {
  return [
    {
      tiltakspakkeId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
      virksomheter: [
        { orgnummer: TILTAKSGRUPPE_ORGNUMMER, deltakelse: "KONTROLLGRUPPE" },
        { orgnummer: ANNET_ORGNUMMER, deltakelse: "UTENFOR_SCOPE" },
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
