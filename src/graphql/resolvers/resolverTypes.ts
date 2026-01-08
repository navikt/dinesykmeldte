import { BaseContext } from "@apollo/server";

export interface ResolverContextType extends BaseContext {
  pid: string;
  accessToken: string;
  xRequestId: string | undefined;
}
