import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "../../utils/test/testUtils";
import PaaminnelseModul from "./PaaminnelseModul";

vi.mock("../lumi/PaaminnelseLumi", () => ({
  PaaminnelseLumi: () => <div data-testid="paaminnelse-lumi" />,
}));

const NARMESTELEDER_ID = "narmesteleder-1";
const ORGNUMMER = "999888777";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("PaaminnelseModul", () => {
  it("viser påminnelse når påminnelse-status er TILGJENGELIG", async () => {
    mockFetchResponses([okJson({ status: "TILGJENGELIG" })]);

    render(
      <PaaminnelseModul
        narmestelederId={NARMESTELEDER_ID}
        orgnummer={ORGNUMMER}
      />,
    );

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
    expect(screen.getByTestId("paaminnelse-lumi")).toBeInTheDocument();
  });

  it("skjules når påminnelse-henting svarer med feilstatus", async () => {
    mockFetchResponses([
      response({ ok: false, body: { feilkode: "STATUS_FEILET" } }),
    ]);

    render(
      <PaaminnelseModul
        narmestelederId={NARMESTELEDER_ID}
        orgnummer={ORGNUMMER}
      />,
    );

    await waitFor(() => expect(fetchMock()).toHaveBeenCalledTimes(1));
    expect(
      screen.queryByRole("heading", {
        name: "Start oppfølging tidlig",
      }),
    ).not.toBeInTheDocument();
  });

  it("skjules når påminnelse-status er SKJULT", async () => {
    mockFetchResponses([okJson({ status: "SKJULT" })]);

    render(
      <PaaminnelseModul
        narmestelederId={NARMESTELEDER_ID}
        orgnummer={ORGNUMMER}
      />,
    );

    await waitFor(() => expect(fetchMock()).toHaveBeenCalledTimes(1));
    expect(
      screen.queryByRole("heading", {
        name: "Start oppfølging tidlig",
      }),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("paaminnelse-lumi")).not.toBeInTheDocument();
  });

  it("bestiller påminnelse og viser bestilt-state", async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetchResponses([
      okJson({ status: "TILGJENGELIG" }),
      okJson({ status: "BESTILT" }),
    ]);

    render(
      <PaaminnelseModul
        narmestelederId={NARMESTELEDER_ID}
        orgnummer={ORGNUMMER}
      />,
    );

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
      okJson({ status: "TILGJENGELIG" }),
      okJson({ status: "BESTILT" }),
    ]);

    render(
      <PaaminnelseModul
        narmestelederId={NARMESTELEDER_ID}
        orgnummer={ORGNUMMER}
      />,
    );

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
      okJson({ status: "BESTILT" }),
      okJson({ status: "TILGJENGELIG" }),
    ]);

    render(
      <PaaminnelseModul
        narmestelederId={NARMESTELEDER_ID}
        orgnummer={ORGNUMMER}
      />,
    );

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
      okJson({ status: "TILGJENGELIG" }),
      okJson({ status: "BESTILT" }),
    ]);

    render(
      <PaaminnelseModul
        narmestelederId={NARMESTELEDER_ID}
        orgnummer={ORGNUMMER}
      />,
    );

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
      okJson({ status: "TILGJENGELIG" }),
      response({ ok: false, body: { feilkode: "BESTILLING_FEILET" } }),
    ]);

    render(
      <PaaminnelseModul
        narmestelederId={NARMESTELEDER_ID}
        orgnummer={ORGNUMMER}
      />,
    );

    await user.click(
      await screen.findByRole("button", { name: "Ja, minn meg på det" }),
    );

    expect(
      await screen.findByText("Vi kunne ikke bestille påminnelsen"),
    ).toBeInTheDocument();
  });
});

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
