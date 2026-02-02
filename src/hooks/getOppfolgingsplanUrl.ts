import { browserEnv } from "../utils/env";

type Props = {
  narmestelederId: string;
  pilotUser: boolean;
};

export function getOppfolgingsplanUrl({
  narmestelederId,
  pilotUser,
}: Props): string {
  return pilotUser
    ? `${browserEnv.nyOppfolgingsplanRoot}/${narmestelederId}`
    : `${browserEnv.oppfolgingsplanerUrl}/${narmestelederId}`;
}
