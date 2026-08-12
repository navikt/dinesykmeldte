import { act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VirksomheterDocument } from "../../graphql/queries/graphql.generated";
import { OPPFOLGINGSPLAN_TILTAKSPAKKE_1 } from "../../services/tiltakspakke/tiltakspakkevurderingContract";
import filterSlice from "../../state/filterSlice";
import {
  createInitialQuery,
  createVirksomhet,
} from "../../utils/test/dataCreators";
import { createTestStore, render, screen } from "../../utils/test/testUtils";
import {
  TiltakspakkevurderingProbe,
  ventPaaAvklartTiltakspakkevurdering,
} from "../../utils/test/tiltakspakkevurderingProbe";
import KomIGangTidligInfo from "./KomIGangTidligInfo";

const TILTAKSGRUPPE_ORGNUMMER = "123456789";
const ANNET_ORGNUMMER = "987654321";

const HEADING = "Kom i gang tidlig når en ansatt er sykmeldt";
const BRODTEKST =
  "Å ta den første samtalen tidlig viser at du er der. Å ha kontakt helt fra start og følge opp underveis kan gjøre det enklere for den som er sykmeldt å komme tilbake til jobb, at risiko for langvarig sykefravær reduseres.";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("KomIGangTidligInfo", () => {
  it("viser boksen når valgt virksomhet er i tiltaksgruppen", async () => {
    mockFetchResponses([okJson(blandetVurdering())]);

    renderKomIGangTidligInfo({ valgtVirksomhet: TILTAKSGRUPPE_ORGNUMMER });

    const overskrift = await screen.findByRole("heading", { name: HEADING });
    expect(overskrift).toBeInTheDocument();
    expect(overskrift.tagName).toBe("H2");
    expect(screen.getByText(BRODTEKST)).toBeInTheDocument();
    expect(screen.getByRole("region", { name: HEADING })).toBeInTheDocument();
  });

  it("viser boksen når brukeren bare har én virksomhet og den er i tiltaksgruppen", async () => {
    mockFetchResponses([okJson(tiltaksgruppeVurdering())]);

    renderKomIGangTidligInfo({
      virksomheter: [
        { navn: "Stor & Syk AS", orgnummer: TILTAKSGRUPPE_ORGNUMMER },
      ],
    });

    expect(
      await screen.findByRole("heading", { name: HEADING }),
    ).toBeInTheDocument();
  });

  it.each([
    {
      name: "tom tiltakspakkevurdering",
      vurderinger: [],
    },
    {
      name: "ingen virksomheter i vurderingen",
      vurderinger: [
        { tiltakspakkeId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1, virksomheter: [] },
      ],
    },
    {
      name: "KONTROLLGRUPPE",
      vurderinger: [
        {
          tiltakspakkeId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
          virksomheter: [
            {
              orgnummer: TILTAKSGRUPPE_ORGNUMMER,
              deltakelse: "KONTROLLGRUPPE",
            },
            { orgnummer: ANNET_ORGNUMMER, deltakelse: "KONTROLLGRUPPE" },
          ],
        },
      ],
    },
    {
      name: "UTENFOR_SCOPE",
      vurderinger: [
        {
          tiltakspakkeId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
          virksomheter: [
            { orgnummer: TILTAKSGRUPPE_ORGNUMMER, deltakelse: "UTENFOR_SCOPE" },
          ],
        },
      ],
    },
    {
      name: "ukjent deltakelse",
      vurderinger: [
        {
          tiltakspakkeId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
          virksomheter: [
            { orgnummer: TILTAKSGRUPPE_ORGNUMMER, deltakelse: "UKJENT" },
          ],
        },
      ],
    },
    {
      name: "tiltaksgruppe for en virksomhet brukeren ikke har",
      vurderinger: [
        {
          tiltakspakkeId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
          virksomheter: [
            { orgnummer: "000000000", deltakelse: "TILTAKSGRUPPE" },
          ],
        },
      ],
    },
  ])("skjules ved $name", async ({ vurderinger }) => {
    mockFetchResponses([okJson(vurderinger)]);

    renderKomIGangTidligInfo({ valgtVirksomhet: TILTAKSGRUPPE_ORGNUMMER });

    await ventPaaAvklartTiltakspakkevurdering();
    expect(
      screen.queryByRole("heading", { name: HEADING }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(BRODTEKST)).not.toBeInTheDocument();
  });

  it("skjules når tiltakspakke-henting feiler", async () => {
    const fetchMock = vi.fn();
    fetchMock.mockRejectedValue(new Error("network"));
    vi.stubGlobal("fetch", fetchMock);

    renderKomIGangTidligInfo({ valgtVirksomhet: TILTAKSGRUPPE_ORGNUMMER });

    await ventPaaAvklartTiltakspakkevurdering();
    expect(
      screen.queryByRole("heading", { name: HEADING }),
    ).not.toBeInTheDocument();
  });

  it("skjules når valgt virksomhet er utenfor tiltaksgruppen", async () => {
    mockFetchResponses([okJson(blandetVurdering())]);

    renderKomIGangTidligInfo({ valgtVirksomhet: ANNET_ORGNUMMER });

    await ventPaaAvklartTiltakspakkevurdering();
    expect(
      screen.queryByRole("heading", { name: HEADING }),
    ).not.toBeInTheDocument();
  });

  // Avklart domeneregel: når «Alle virksomheter» er valgt, vises boksen hvis
  // minst én av brukerens virksomheter er i tiltaksgruppen. Det er akseptert
  // at brukeren samtidig har virksomheter i kontrollgruppen.
  it("viser boksen ved «Alle virksomheter» når minst én virksomhet er i tiltaksgruppen", async () => {
    mockFetchResponses([okJson(blandetVurdering())]);

    renderKomIGangTidligInfo();

    expect(
      await screen.findByRole("heading", { name: HEADING }),
    ).toBeInTheDocument();
    expect(screen.getByText(BRODTEKST)).toBeInTheDocument();
  });

  it("skjules ved «Alle virksomheter» når ingen av virksomhetene er i tiltaksgruppen", async () => {
    mockFetchResponses([okJson(kunKontrollgruppeVurdering())]);

    renderKomIGangTidligInfo();

    await ventPaaAvklartTiltakspakkevurdering();
    expect(
      screen.queryByRole("heading", { name: HEADING }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(BRODTEKST)).not.toBeInTheDocument();
  });

  it("skjuler boksen når brukeren bytter fra «Alle virksomheter» til en kontrollvirksomhet", async () => {
    mockFetchResponses([okJson(blandetVurdering())]);

    const store = createTestStore();
    renderKomIGangTidligInfo({ store });

    expect(
      await screen.findByRole("heading", { name: HEADING }),
    ).toBeInTheDocument();

    act(() => {
      store.dispatch(filterSlice.actions.setVirksomhet(ANNET_ORGNUMMER));
    });

    // Vurderingen er allerede ferdig behandlet (boksen var synlig over), så
    // dette er en reell negativ tilstand og ikke bare «ikke lastet ennå».
    expect(
      screen.queryByRole("heading", { name: HEADING }),
    ).not.toBeInTheDocument();
  });

  it("viser boksen igjen når brukeren bytter fra en kontrollvirksomhet til «Alle virksomheter»", async () => {
    mockFetchResponses([okJson(blandetVurdering())]);

    const store = createTestStore();
    renderKomIGangTidligInfo({ store, valgtVirksomhet: ANNET_ORGNUMMER });

    await ventPaaAvklartTiltakspakkevurdering();
    expect(
      screen.queryByRole("heading", { name: HEADING }),
    ).not.toBeInTheDocument();

    act(() => {
      store.dispatch(filterSlice.actions.setVirksomhet("all"));
    });

    expect(
      await screen.findByRole("heading", { name: HEADING }),
    ).toBeInTheDocument();
  });

  it("skjuler boksen når brukeren bytter fra tiltaksgruppe til kontrollgruppe", async () => {
    mockFetchResponses([okJson(blandetVurdering())]);

    const store = createTestStore();
    renderKomIGangTidligInfo({
      store,
      valgtVirksomhet: TILTAKSGRUPPE_ORGNUMMER,
    });

    expect(
      await screen.findByRole("heading", { name: HEADING }),
    ).toBeInTheDocument();

    act(() => {
      store.dispatch(filterSlice.actions.setVirksomhet(ANNET_ORGNUMMER));
    });

    // Vurderingen er allerede ferdig behandlet (boksen var synlig over), så
    // dette er en reell negativ tilstand og ikke bare «ikke lastet ennå».
    expect(
      screen.queryByRole("heading", { name: HEADING }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(BRODTEKST)).not.toBeInTheDocument();
  });

  it("viser boksen igjen når brukeren bytter tilbake til tiltaksgruppen", async () => {
    mockFetchResponses([okJson(blandetVurdering())]);

    const store = createTestStore();
    renderKomIGangTidligInfo({ store, valgtVirksomhet: ANNET_ORGNUMMER });

    await ventPaaAvklartTiltakspakkevurdering();
    expect(
      screen.queryByRole("heading", { name: HEADING }),
    ).not.toBeInTheDocument();

    act(() => {
      store.dispatch(
        filterSlice.actions.setVirksomhet(TILTAKSGRUPPE_ORGNUMMER),
      );
    });

    expect(
      await screen.findByRole("heading", { name: HEADING }),
    ).toBeInTheDocument();
  });
});

type Virksomhetsoppsett = {
  readonly navn: string;
  readonly orgnummer: string;
};

function renderKomIGangTidligInfo({
  store,
  valgtVirksomhet,
  virksomheter = [
    { navn: "Stor & Syk AS", orgnummer: TILTAKSGRUPPE_ORGNUMMER },
    { navn: "Annen virksomhet", orgnummer: ANNET_ORGNUMMER },
  ],
}: {
  readonly store?: ReturnType<typeof createTestStore>;
  readonly valgtVirksomhet?: string;
  readonly virksomheter?: ReadonlyArray<Virksomhetsoppsett>;
} = {}): void {
  const reduxStore = store ?? createTestStore();
  if (valgtVirksomhet != null) {
    reduxStore.dispatch(filterSlice.actions.setVirksomhet(valgtVirksomhet));
  }

  render(
    <>
      <KomIGangTidligInfo />
      <TiltakspakkevurderingProbe />
    </>,
    {
      store: reduxStore,
      initialState: [
        createInitialQuery(VirksomheterDocument, {
          __typename: "Query",
          virksomheter: virksomheter.map((it) => createVirksomhet(it)),
        }),
      ],
    },
  );
}

function tiltaksgruppeVurdering(): unknown {
  return [
    {
      tiltakspakkeId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
      virksomheter: [
        { orgnummer: TILTAKSGRUPPE_ORGNUMMER, deltakelse: "TILTAKSGRUPPE" },
      ],
    },
  ];
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

function mockFetchResponses(responses: Response[]): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn();
  responses.forEach((mockResponse) => {
    fetchMock.mockResolvedValueOnce(mockResponse);
  });
  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}

function okJson(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
