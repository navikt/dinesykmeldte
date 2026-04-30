import { browserEnv } from "../utils/env";

type Props = {
  narmestelederId: string;
};

export function getOppfolgingsplanUrl({ narmestelederId }: Props): string {
  return `${browserEnv.nyOppfolgingsplanRoot}/${narmestelederId}`;
}
