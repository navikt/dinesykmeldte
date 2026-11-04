import { BandageIcon } from "@navikt/aksel-icons";
import { Tag } from "@navikt/ds-react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { markHendelserResolved } from "../../../utils/hendelseUtils";
import { render, screen } from "../../../utils/test/testUtils";
import LinkPanel from "./LinkPanel";

vi.mock("../../../utils/hendelseUtils", () => ({
  markHendelserResolved: vi.fn(),
}));

describe("LinkPanel", () => {
  it("should render a simple plain link panel", () => {
    render(
      <LinkPanel Icon={BandageIcon} href="/test/url">
        Søknad om sykepenger
      </LinkPanel>,
    );

    expect(
      screen.getByRole("link", { name: /Søknad om sykepenger/ }),
    ).toBeInTheDocument();
  });

  it("should render a complex link panel", () => {
    render(
      <LinkPanel
        tag={
          <Tag data-color="warning" variant="moderate" size="small">
            Ikke sendt
          </Tag>
        }
        description="100% i 31 dager"
        notify
        detail="11. juni - 17. august"
        Icon={BandageIcon}
        href="/test/url"
      >
        Søknad om sykepenger
      </LinkPanel>,
    );

    const linkPanel = screen.getByRole("link", {
      name: /Søknad om sykepenger/,
    });
    expect(linkPanel).toHaveTextContent(/11. juni - 17. august/);
    expect(linkPanel).toHaveTextContent(/100% i 31 dager/);
    expect(linkPanel).toHaveTextContent(/Ikke sendt/);
  });

  it("external=absolute link should have right attributes", () => {
    render(
      <LinkPanel
        tag={
          <Tag data-color="warning" variant="moderate" size="small">
            Ikke sendt
          </Tag>
        }
        description="100% i 31 dager"
        notify
        detail="11. juni - 17. august"
        Icon={BandageIcon}
        href="https://example.com/test/url"
        external="absolute"
      >
        Søknad om sykepenger
      </LinkPanel>,
    );

    const linkPanel = screen.getByRole("link", {
      name: /Søknad om sykepenger/,
    });
    expect(linkPanel).toHaveAttribute("target", "_blank");
    expect(linkPanel).toHaveAttribute("rel", "noopener noreferrer");
    expect(linkPanel).toHaveAttribute("href", "https://example.com/test/url");
  });

  it("external link with external=proxy href should prepend basepath", () => {
    render(
      <LinkPanel
        tag={
          <Tag data-color="warning" variant="moderate" size="small">
            Ikke sendt
          </Tag>
        }
        description="100% i 31 dager"
        notify
        detail="11. juni - 17. august"
        Icon={BandageIcon}
        href="https://example.com/test/url"
        external="absolute"
        hendelseIds={["test-hendelse-id"]}
      >
        Søknad om sykepenger
      </LinkPanel>,
    );

    const linkPanel = screen.getByRole("link", {
      name: /Søknad om sykepenger/,
    });
    expect(linkPanel).toHaveAttribute("href", "https://example.com/test/url");
    // External links should open in a new window
    expect(linkPanel).toHaveAttribute("target", "_blank");
    expect(linkPanel).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("internal link marks hendelser resolved before calling onClick", async () => {
    const calls: string[] = [];
    vi.mocked(markHendelserResolved).mockImplementation(() => {
      calls.push("resolved");
    });
    const onClick = vi.fn(() => {
      calls.push("onClick");
    });
    render(
      <LinkPanel
        Icon={BandageIcon}
        href="/test/url"
        hendelseIds={["test-hendelse-id"]}
        onClick={onClick}
      >
        Søknad om sykepenger
      </LinkPanel>,
    );

    await userEvent.click(
      screen.getByRole("link", { name: /Søknad om sykepenger/ }),
    );

    expect(markHendelserResolved).toHaveBeenCalledWith(["test-hendelse-id"]);
    expect(onClick).toHaveBeenCalledOnce();
    expect(calls).toEqual(["resolved", "onClick"]);
  });
});
