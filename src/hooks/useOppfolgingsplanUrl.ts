import { browserEnv } from "../utils/env";

type Args = {
  narmestelederId: string;
  pilotUser: boolean;
};

export function useOppfolgingsplanUrl({
  narmestelederId,
  pilotUser,
}: Args): string {
  return pilotUser
    ? `${browserEnv.nyOppfolgingsplanRoot}/${narmestelederId}`
    : `${browserEnv.oppfolgingsplanerUrl}/${narmestelederId}`;
}
