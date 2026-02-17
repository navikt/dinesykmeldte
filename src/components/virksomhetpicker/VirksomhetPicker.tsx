import { useQuery } from "@apollo/client";
import { HelpText, Select } from "@navikt/ds-react";
import { useRouter } from "next/router";
import React, { type ReactElement, useCallback } from "react";
import { useDispatch } from "react-redux";
import { VirksomheterDocument } from "../../graphql/queries/graphql.generated";
import useSelectedVirksomhet from "../../hooks/useSelectedSykmeldt";
import filterSlice from "../../state/filterSlice";

function VirksomhetPicker(): ReactElement {
  const router = useRouter();
  const dispatch = useDispatch();
  const virksomhet = useSelectedVirksomhet();
  const initialVirksomhet =
    (router.query.bedrift as string | undefined) ?? null;

  const { data, loading } = useQuery(VirksomheterDocument, {
    returnPartialData: true,
  });
  const virksomhetCount = data?.virksomheter.length ?? 0;

  const handleVirksomhetChange = useCallback(
    (virksomhetId: string) => {
      dispatch(filterSlice.actions.setVirksomhet(virksomhetId));
    },
    [dispatch],
  );

  return (
    <div className="flex min-w-[240px] items-center">
      <Select
        className="-mt-8 flex-auto"
        label="Velg virksomhet"
        disabled={loading || virksomhetCount === 0 || initialVirksomhet != null}
        value={virksomhet}
        onChange={(event) => handleVirksomhetChange(event.target.value)}
        autoComplete="off"
      >
        {loading && <option value="">Laster virksomheter...</option>}
        {!loading && virksomhetCount === 0 && (
          <option>Ingen virksomheter</option>
        )}
        {!loading && virksomhetCount > 0 && (
          <option value="all">Alle virksomheter</option>
        )}
        {data?.virksomheter &&
          data.virksomheter.map((it) => (
            <option key={it.orgnummer} value={it.orgnummer}>
              {it.navn}
            </option>
          ))}
      </Select>
      <HelpText className="ml-4" title="vis hjelpetekst angående virksomheter">
        Virksomheten der du er meldt inn som nærmeste leder er synlig i listen
        inntil 4 måneder etter at medarbeiderene er friskmeldte.
      </HelpText>
    </div>
  );
}

export default VirksomhetPicker;
