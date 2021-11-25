import { PreviewSykmeldtFragment } from '../graphql/queries/react-query.generated';

export function formatNamePossessive(sykmeldt: PreviewSykmeldtFragment | null, postfix: string) {
    if (sykmeldt?.navn) {
        return `${sykmeldt.navn}s ${postfix}`;
    } else {
        return `Sykmeldtes ${postfix}`;
    }
}
