import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
  type Tiltakspakkevurderinger,
} from "../../services/tiltakspakke/tiltakspakkevurderingContract";
import { render, screen, waitFor } from "../../utils/test/testUtils";
import PaaminnelseModul from "./PaaminnelseModul";

const NARMESTELEDER_ID = "narmesteleder-1";
const ORGNUMMER = "999888777";

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
      okJson({ status: "TILGJENGELIG" }),
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
    mockFetchResponses([okJson(vurderinger)]);

    render(<DefaultPaaminnelseModul />);

    // Gated ut av tiltakspakke ⇒ påminnelse-BFF skal ikke kalles (default-deny).
    await waitFor(() => expect(fetchMock()).toHaveBeenCalledTimes(1));
    expect(fetchMock()).not.toHaveBeenCalledWith(
      expect.stringContaining("/api/paaminnelse/"),
      expect.anything(),
    );
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
    ]);

    render(<DefaultPaaminnelseModul />);

    await waitFor(() => expect(fetchMock()).toHaveBeenCalledTimes(1));
    expect(fetchMock()).not.toHaveBeenCalledWith(
      expect.stringContaining("/api/paaminnelse/"),
      expect.anything(),
    );
    expect(
      screen.queryByRole("heading", {
        name: "Start oppfølging tidlig",
      }),
    ).not.toBeInTheDocument();
  });

  it("skjules når tiltakspakke-henting feiler", async () => {
    const fetchMock = vi.fn();
    fetchMock.mockRejectedValueOnce(new Error("network"));
    vi.stubGlobal("fetch", fetchMock);

    render(<DefaultPaaminnelseModul />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).not.toHaveBeenCalledWith(
      expect.stringContaining("/api/paaminnelse/"),
      expect.anything(),
    );
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
      okJson({ status: "SKJULT" }),
    ]);

    render(<DefaultPaaminnelseModul />);

    await waitFor(() => expect(fetchMock()).toHaveBeenCalledTimes(2));
    expect(
      screen.queryByRole("heading", {
        name: "Start oppfølging tidlig",
      }),
    ).not.toBeInTheDocument();
  });

  it("bestiller påminnelse og viser bestilt-state", async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetchResponses([
      okJson(createTiltaksgruppeVurdering()),
      okJson({ status: "TILGJENGELIG" }),
      okJson({ status: "BESTILT" }),
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

  it("beholder synlig boks når skrivesvar bare returnerer ny status", async () => {
    const user = userEvent.setup();
    mockFetchResponses([
      okJson(createTiltaksgruppeVurdering()),
      okJson({ status: "TILGJENGELIG" }),
      okJson({ status: "BESTILT" }),
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
      okJson({ status: "BESTILT" }),
      okJson({ status: "TILGJENGELIG" }),
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

  it("bekrefter bestilling med synlig suksess-varsel", async () => {
    const user = userEvent.setup();
    mockFetchResponses([
      okJson(createTiltaksgruppeVurdering()),
      okJson({ status: "TILGJENGELIG" }),
      okJson({ status: "BESTILT" }),
    ]);

    render(<DefaultPaaminnelseModul />);

    await user.click(
      await screen.findByRole("button", { name: "Ja, minn meg på det" }),
    );

    // Bestillingen bekreftes med synlig suksess-innhold. LocalAlert har
    // role="alert" (dokumentert Aksel-oppførsel), så innholdet leses opp
    // assertivt av skjermleser uten en egen sr-only-melding. Vi asserter på
    // synlig innhold framfor å binde testen til bibliotekets rolle-detalj.
    expect(
      await screen.findByRole("heading", { name: /Du vil få en påminnelse/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Dersom du ikke allerede har sendt inn en plan, får du påminnelse på e-post når fristen nærmer seg.",
      ),
    ).toBeInTheDocument();
  });

  it("viser lokal inline-feil når bestilling feiler", async () => {
    const user = userEvent.setup();
    mockFetchResponses([
      okJson(createTiltaksgruppeVurdering()),
      okJson({ status: "TILGJENGELIG" }),
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
