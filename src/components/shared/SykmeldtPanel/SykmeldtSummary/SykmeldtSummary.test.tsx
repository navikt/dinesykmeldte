import { describe, expect, it } from "vitest";
import {
  createPreviewSendtSoknad,
  createPreviewSykmeldt,
  createSykmelding,
} from "../../../../utils/test/dataCreators";
import { render, screen } from "../../../../utils/test/testUtils";
import SykmeldtSummary from "./SykmeldtSummary";

describe("SykmeldtCard", () => {
  it("should format new varsler when there is one unread sykmelding", () => {
    render(
      <SykmeldtSummary
        sykmeldt={createPreviewSykmeldt({
          sykmeldinger: [createSykmelding({ lest: false })],
        })}
        notification
        notSentSoknad={false}
        isHeadingLevel4={false}
      />,
    );

    expect(
      screen.getByRole("tooltip", { name: "Du har 1 ulest varsel." }),
    ).toBeInTheDocument();
  });

  it("should format new varsler when there is multiple unread", () => {
    render(
      <SykmeldtSummary
        sykmeldt={createPreviewSykmeldt({
          sykmeldinger: [createSykmelding({ lest: false })],
          previewSoknader: [createPreviewSendtSoknad({ lest: false })],
        })}
        notification
        notSentSoknad={false}
        isHeadingLevel4={false}
      />,
    );

    expect(
      screen.getByRole("tooltip", { name: "Du har 2 uleste varsler." }),
    ).toBeInTheDocument();
  });
});
