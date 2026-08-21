import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { render, screen } from "../../utils/test/testUtils";
import AnsvarVedSykefravaer from "./AnsvarVedSykefravaer";

const ANSVARSPUNKTER = [
  {
    title: "Slik lager du en oppfølgingsplan",
    bodyText:
      "Lag planen sammen med den som er sykmeldt innen 4 uker. Den skal beskrive arbeidsoppgaver som er mulige nå, og tilretteleggingen dere blir enige om. Målet med oppfølgingsplanen er å etablere løsninger som er tilpasset den sykmeldtes situasjon og arbeidsgivers muligheter for tilrettelegging.",
    linkText: "Om oppfølgingsplan på nav.no",
    href: "https://www.nav.no/arbeidsgiver/oppfolgingsplan",
  },
  {
    title: "Slik gjennomfører du dialogmøte 1",
    bodyText:
      "Dialogmøte 1 er et lovpålagt møte (frist innen 7 uker) som handler om veien tilbake til jobb, hvilke muligheter som finnes og konkrete videre steg i sykefraværsforløpet. Målet er å unngå unødvendig langt sykefravær. I tillegg anbefaler vi regelmessig kontakt gjennom hele forløpet uavhengig av varighet. Finn ut sammen hva som passer best.",
    linkText: "Om dialogmøte på nav.no",
    href: "https://www.nav.no/arbeidsgiver/oppfolging-sykmeldte#dialogmote-1",
  },
  {
    title: "Slik tilrettelegger du for den som er sykmeldt",
    bodyText:
      "Du har ansvar for å tilrettelegge så langt det er mulig, slik at den som er sykmeldt klarer å utføre noen oppgaver eller jobbe litt i sykmeldingsperioden. Det kan også være tilpasset arbeidstid, nødvendige hjelpemidler eller nye arbeidsoppgaver. Den ansatte har på sin side plikt til å bidra så dere sammen finner løsninger som fungerer.",
    linkText: "Om tilrettelegging på nav.no",
    href: "https://www.nav.no/arbeidsgiver/oppfolging-sykmeldte#tilrettelegging",
  },
  {
    title: "Slik følger du opp gjennom hele sykefraværet",
    bodyText:
      "Hold jevnlig kontakt med den ansatte gjennom hele sykefraværet. Husk å overholde frister og melde gjerne fra til oss i Nav hvis du/dere trenger hjelp til noe. Din innsats kan være avgjørende for tilknytningen til arbeidslivet for den som er sykmeldt. Vi vet at tett samarbeid og dialog bidrar til at flere kommer tidligere tilbake i jobb.",
    linkText: "Oppfølging underveis i sykefraværet",
    href: "https://www.nav.no/arbeidsgiver/oppfolging-sykmeldte",
  },
] as const;

describe("AnsvarVedSykefravaer", () => {
  it("viser ansvarsområdene og lenkene fra oppgaven", () => {
    render(<AnsvarVedSykefravaer />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Ditt ansvar når en av dine ansatte er sykmeldt",
      }),
    ).toBeInTheDocument();

    ANSVARSPUNKTER.forEach(({ title, bodyText, linkText, href }) => {
      expect(screen.getByRole("button", { name: title })).toBeInTheDocument();
      expect(screen.getByText(bodyText)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: linkText })).toHaveAttribute(
        "href",
        href,
      );
    });

    expect(
      screen.getByRole("link", { name: "Kontakt Nav som arbeidsgiver" }),
    ).toHaveAttribute("href", "https://www.nav.no/arbeidsgiver/kontaktoss");
  });

  it("er lukket ved første visning og kan åpnes med tastaturet", async () => {
    const user = userEvent.setup();
    render(<AnsvarVedSykefravaer />);

    const firstHeader = screen.getByRole("button", {
      name: ANSVARSPUNKTER[0].title,
    });

    await user.tab();
    expect(firstHeader).toHaveFocus();
    expect(firstHeader).toHaveAttribute("aria-expanded", "false");

    await user.keyboard("{Enter}");
    expect(firstHeader).toHaveAttribute("aria-expanded", "true");

    await user.keyboard(" ");
    expect(firstHeader).toHaveAttribute("aria-expanded", "false");
  });
});
