import type { LumiSurveyConfig } from "@navikt/lumi-survey";

export const survey: LumiSurveyConfig = {
  type: "custom",
  questions: [
    {
      id: "hvor-ofte",
      type: "singleChoice",
      prompt: "Hvor ofte har du sykmeldte ansatte som du følger opp?",
      required: true,
      options: [
        { value: "svaert-ofte", label: "Svært ofte" },
        { value: "ofte", label: "Ofte" },
        { value: "av-og-til", label: "Av og til" },
        { value: "sjelden", label: "Sjelden" },
        { value: "aldri", label: "Aldri" },
      ],
    },
    {
      id: "storste-hindringene",
      type: "multiChoice",
      prompt:
        "Hva er de største hindringene du opplever når du skal følge opp en ansatt som er sykmeldt?",
      required: true,
      variant: "checkbox",
      options: [
        { value: "manglende-tid", label: "Manglende tid" },
        { value: "usikkerhet-om-regelverk", label: "Usikkerhet om regelverk" },
        {
          value: "vanskelig-a-snakke-om-helse-med-ansatte",
          label: "Vanskelig å snakke om helse med ansatte",
        },
        {
          value: "lite-rom-for-tilrettelegging",
          label: "Lite rom for tilrettelegging",
        },
        {
          value: "lite-stotte-fra-ledelsen",
          label: "Lite støtte fra ledelsen",
        },
        { value: "tekniske-utfordringer", label: "Tekniske utfordringer" },
        {
          value: "motvilje-fra-den-ansatte",
          label: "Motvilje fra den ansatte",
        },
        { value: "annet", label: "Annet" },
      ],
    },
    {
      id: "storste-hindringene-annet",
      type: "text",
      prompt: "Hva annet hindrer deg i oppfølgingen?",
      visibleIf: {
        questionId: "storste-hindringene",
        operator: "CONTAINS",
        value: "annet",
      },
      required: true,
      maxLength: 500,
      minRows: 3,
    },
    {
      id: "viktigst",
      type: "multiChoice",
      prompt:
        "Ut ifra din erfaring, hva er viktigst for at du skal lykkes med sykefraværsoppfølging?",
      required: true,
      variant: "checkbox",
      options: [
        { value: "klare-steg-og-tidslinje", label: "Klare steg og tidslinje" },
        {
          value: "tydelige-varsler-til-riktig-oyeblikk",
          label: "Tydelige varsler til riktig øyeblikk",
        },
        { value: "eksempler-eller-maler", label: "Eksempler eller maler" },
        {
          value: "bedre-kommunikasjon-med-lege-nav",
          label: "Bedre kommunikasjon med lege/Nav",
        },
        { value: "bedre-interne-rutiner", label: "Bedre interne rutiner" },
        { value: "annet", label: "Annet" },
      ],
    },
    {
      id: "viktigst-annet",
      type: "text",
      prompt: "Hva annet mener du er viktig i oppfølgingen?",
      visibleIf: {
        questionId: "viktigst",
        operator: "CONTAINS",
        value: "annet",
      },
      required: true,
      maxLength: 500,
      minRows: 3,
    },
    {
      id: "nav-digitale-tjenester",
      type: "text",
      prompt:
        "Hva tenker du at Nav bør tilby av digitale tjenester for at du skal lykkes med oppfølgingen av dine sykmeldte ansatte?",
      required: false,
      maxLength: 500,
      minRows: 3,
    },
  ],
};
