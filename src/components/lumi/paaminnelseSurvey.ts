import type { SurveyDocumentV1 } from "@navikt/lumi-survey";

// Basert på Surveyverksted-revisjon 0b8d64c7-40c4-4083-bd14-b8ea74b0a257,
// med svaralternativet «Vet ikke» fra forrige revisjon.
export const paaminnelseSurvey = {
  authoringSchemaVersion: 1,
  pages: [
    {
      id: "sporsmal",
      questions: [
        {
          description:
            "Det gjelder tilbudet «Start oppfølging tidlig» på denne siden. Svaret kobles ikke til deg eller den ansatte.",
          id: "sporsmal",
          options: [
            { label: "Veldig nyttig", value: "veldig-nyttig" },
            { label: "Ganske nyttig", value: "ganske-nyttig" },
            { label: "Lite nyttig", value: "lite-nyttig" },
            { label: "Ikke nyttig", value: "ikke-nyttig" },
            { label: "Vet ikke", value: "vet-ikke" },
          ],
          prompt: "Hvor nyttig er tilbudet om påminnelse på e-post for deg?",
          required: true,
          type: "singleChoice",
        },
      ],
    },
    {
      id: "side-06812cfb-e8f9-4b4a-b064-8617ae4367f8",
      questions: [
        {
          description: "Skriv gjerne hva du tenker om tilbudet.",
          id: "text-6dc5d68c",
          maxLength: 500,
          minRows: 4,
          prompt: "Vil du fortelle oss mer?",
          type: "text",
        },
      ],
    },
  ],
  success: {
    body: "Svarene hjelper oss å gjøre Dine sykmeldte bedre.",
    title: "Takk for svaret!",
  },
  type: "custom",
} satisfies SurveyDocumentV1;
