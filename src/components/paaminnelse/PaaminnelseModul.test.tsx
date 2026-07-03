import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
  type Tiltakspakkevurderinger,
} from "../../services/tiltakspakke/tiltakspakkevurderingContract";
import { createAktivitetIkkeMuligPeriode } from "../../utils/test/dataCreators";
import { render, screen, waitFor } from "../../utils/test/testUtils";
import PaaminnelseModul from "./PaaminnelseModul";

const NARMESTELEDER_ID = "narmesteleder-1";
const ORGNUMMER = "999888777";
const DEFAULT_PERIODER = [
  createAktivitetIkkeMuligPeriode({ fom: "2026-06-01" }),
];

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("PaaminnelseModul", () => {
  it("viser påminnelse når tiltakspakkevurdering og påminnelse-status åpner for det", async () => {
    mockFetchResponses([
      okJson(createTiltaksgruppeVurdering()),
      okJson({ status: "TILGJENGELIG", synligFra: "2026-05-01" }),
    ]);

    render(<DefaultPaaminnelseModul />);

    expect(
      await screen.findByRole("button", { name: "Ja, minn meg på det" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Start oppfølging tidlig",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Som nærmeste leder er din oppfølging ofte avgjørende for hvor raskt den ansatte kommer tilbake. Start med en tidlig samtale.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/2026/)).not.toBeInTheDocument();
  });

  it.each([
    {
      name: "tom tiltakspakkevurdering",
      vurderinger: [],
    },
    {
      name: "manglende virksomhet",
      vurderinger: [
        {
          tiltakspakkeId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
          virksomheter: [],
        },
      ],
    },
    {
      name: "KONTROLLGRUPPE",
      vurderinger: [
        {
          tiltakspakkeId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
          virksomheter: [
            { orgnummer: ORGNUMMER, deltakelse: "KONTROLLGRUPPE" },
          ],
        },
      ],
    },
    {
      name: "UTENFOR_SCOPE",
      vurderinger: [
        {
          tiltakspakkeId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
          virksomheter: [{ orgnummer: ORGNUMMER, deltakelse: "UTENFOR_SCOPE" }],
        },
      ],
    },
    {
      name: "ukjent deltakelse",
      vurderinger: [
        {
          tiltakspakkeId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
          virksomheter: [{ orgnummer: ORGNUMMER, deltakelse: "UKJENT" }],
        },
      ],
    },
  ])("skjules ved $name", async ({ vurderinger }) => {
    mockFetchResponses([
      okJson(vurderinger),
      okJson({ status: "TILGJENGELIG", synligFra: null }),
    ]);

    render(<DefaultPaaminnelseModul />);

    await waitFor(() => expect(fetchMock()).toHaveBeenCalledTimes(2));
    expect(
      screen.queryByRole("heading", {
        name: "Start oppfølging tidlig",
      }),
    ).not.toBeInTheDocument();
  });

  it("skjules når TILTAKSGRUPPE gjelder et annet orgnummer", async () => {
    mockFetchResponses([
      okJson([
        {
          tiltakspakkeId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
          virksomheter: [
            { orgnummer: "000000000", deltakelse: "TILTAKSGRUPPE" },
          ],
        },
      ]),
      okJson({ status: "TILGJENGELIG", synligFra: "2026-05-01" }),
    ]);

    render(<DefaultPaaminnelseModul />);

    await waitFor(() => expect(fetchMock()).toHaveBeenCalledTimes(2));
    expect(
      screen.queryByRole("heading", {
        name: "Start oppfølging tidlig",
      }),
    ).not.toBeInTheDocument();
  });

  it("skjules når tiltakspakke-henting feiler", async () => {
    const fetchMock = vi.fn();
    fetchMock.mockRejectedValueOnce(new Error("network"));
    fetchMock.mockResolvedValueOnce(
      okJson({ status: "TILGJENGELIG", synligFra: "2026-05-01" }),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<DefaultPaaminnelseModul />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(
      screen.queryByRole("heading", {
        name: "Start oppfølging tidlig",
      }),
    ).not.toBeInTheDocument();
  });

  it("skjules når påminnelse-henting svarer med feilstatus", async () => {
    mockFetchResponses([
      okJson(createTiltaksgruppeVurdering()),
      response({ ok: false, body: { feilkode: "STATUS_FEILET" } }),
    ]);

    render(<DefaultPaaminnelseModul />);

    await waitFor(() => expect(fetchMock()).toHaveBeenCalledTimes(2));
    expect(
      screen.queryByRole("heading", {
        name: "Start oppfølging tidlig",
      }),
    ).not.toBeInTheDocument();
  });

  it("skjules når påminnelse-status er SKJULT", async () => {
    mockFetchResponses([
      okJson(createTiltaksgruppeVurdering()),
      okJson({ status: "SKJULT", synligFra: null }),
    ]);

    render(<DefaultPaaminnelseModul />);

    await waitFor(() => expect(fetchMock()).toHaveBeenCalledTimes(2));
    expect(
      screen.queryByRole("heading", {
        name: "Start oppfølging tidlig",
      }),
    ).not.toBeInTheDocument();
  });

  it("skjules når synligFra mangler på enkeltvis sykmelding", async () => {
    mockFetchResponses([
      okJson(createTiltaksgruppeVurdering()),
      okJson({ status: "TILGJENGELIG", synligFra: null }),
    ]);

    render(<DefaultPaaminnelseModul />);

    await waitFor(() => expect(fetchMock()).toHaveBeenCalledTimes(2));
    expect(
      screen.queryByRole("heading", {
        name: "Start oppfølging tidlig",
      }),
    ).not.toBeInTheDocument();
  });

  it("skjules når sykmeldingen starter før synligFra", async () => {
    mockFetchResponses([
      okJson(createTiltaksgruppeVurdering()),
      okJson({ status: "TILGJENGELIG", synligFra: "2026-07-01" }),
    ]);

    render(<DefaultPaaminnelseModul />);

    await waitFor(() => expect(fetchMock()).toHaveBeenCalledTimes(2));
    expect(
      screen.queryByRole("button", { name: "Ja, minn meg på det" }),
    ).not.toBeInTheDocument();
  });

  it("bestiller påminnelse og viser bestilt-state", async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetchResponses([
      okJson(createTiltaksgruppeVurdering()),
      okJson({ status: "TILGJENGELIG", synligFra: "2026-05-01" }),
      okJson({ status: "BESTILT", synligFra: null }),
    ]);

    render(<DefaultPaaminnelseModul />);

    await user.click(
      await screen.findByRole("button", { name: "Ja, minn meg på det" }),
    );

    expect(
      await screen.findByRole("button", { name: "Skru av påminnelsen" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Du vil få en påminnelse/ }),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenLastCalledWith(
      `/fake/basepath/api/paaminnelse/${NARMESTELEDER_ID}`,
      expect.objectContaining({
        method: "POST",
        body: "{}",
      }),
    );
  });

  it("beholder synlig boks når write-svar utelater synligFra", async () => {
    const user = userEvent.setup();
    mockFetchResponses([
      okJson(createTiltaksgruppeVurdering()),
      okJson({ status: "TILGJENGELIG", synligFra: "2026-05-01" }),
      // Skrivekontrakten svarer uten synligFra; boksen skal likevel forbli
      // synlig fordi per-sykmelding-synligheten allerede er avgjort.
      okJson({ status: "BESTILT", synligFra: null }),
    ]);

    render(<DefaultPaaminnelseModul />);

    await user.click(
      await screen.findByRole("button", { name: "Ja, minn meg på det" }),
    );

    expect(
      await screen.findByRole("button", { name: "Skru av påminnelsen" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Du vil få en påminnelse/ }),
    ).toBeInTheDocument();
  });

  it("avbestiller påminnelse og viser tilgjengelig-state", async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetchResponses([
      okJson(createTiltaksgruppeVurdering()),
      okJson({ status: "BESTILT", synligFra: "2026-05-01" }),
      okJson({ status: "TILGJENGELIG", synligFra: null }),
    ]);

    render(<DefaultPaaminnelseModul />);

    await user.click(
      await screen.findByRole("button", { name: "Skru av påminnelsen" }),
    );

    expect(
      await screen.findByRole("button", { name: "Ja, minn meg på det" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Påminnelse om oppfølgingsplan avbestilt"),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenLastCalledWith(
      `/fake/basepath/api/paaminnelse/${NARMESTELEDER_ID}`,
      expect.objectContaining({
        method: "DELETE",
      }),
    );
  });

  it("annonserer bestilling via suksess-varsel med alert-rolle", async () => {
    const user = userEvent.setup();
    mockFetchResponses([
      okJson(createTiltaksgruppeVurdering()),
      okJson({ status: "TILGJENGELIG", synligFra: "2026-05-01" }),
      okJson({ status: "BESTILT", synligFra: null }),
    ]);

    render(<DefaultPaaminnelseModul />);

    await user.click(
      await screen.findByRole("button", { name: "Ja, minn meg på det" }),
    );

    // Bestillingen annonseres av selve suksess-varselet (role="alert"), ikke av
    // den sr-only status-regionen — så vi unngår dobbelt-annonsering.
    const varsel = await screen.findByRole("alert");
    expect(varsel).toHaveTextContent("Du vil få en påminnelse");
  });

  it("viser lokal inline-feil når bestilling feiler", async () => {
    const user = userEvent.setup();
    mockFetchResponses([
      okJson(createTiltaksgruppeVurdering()),
      okJson({ status: "TILGJENGELIG", synligFra: "2026-05-01" }),
      response({ ok: false, body: { feilkode: "BESTILLING_FEILET" } }),
    ]);

    render(<DefaultPaaminnelseModul />);

    await user.click(
      await screen.findByRole("button", { name: "Ja, minn meg på det" }),
    );

    expect(
      await screen.findByText("Vi kunne ikke bestille påminnelsen"),
    ).toBeInTheDocument();
  });
});

function DefaultPaaminnelseModul(): ReactElement {
  return (
    <PaaminnelseModul
      narmestelederId={NARMESTELEDER_ID}
      orgnummer={ORGNUMMER}
      sykmeldingPerioder={DEFAULT_PERIODER}
    />
  );
}

function createTiltaksgruppeVurdering(): Tiltakspakkevurderinger {
  return [
    {
      tiltakspakkeId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
      virksomheter: [{ orgnummer: ORGNUMMER, deltakelse: "TILTAKSGRUPPE" }],
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

function fetchMock(): ReturnType<typeof vi.fn> {
  return fetch as unknown as ReturnType<typeof vi.fn>;
}

function okJson(body: unknown): Response {
  return response({ ok: true, body });
}

function response({
  ok,
  body,
}: {
  readonly ok: boolean;
  readonly body: unknown;
}): Response {
  return new Response(JSON.stringify(body), {
    status: ok ? 200 : 502,
    headers: { "Content-Type": "application/json" },
  });
}
