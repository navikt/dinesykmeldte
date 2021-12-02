import { TokenPayload } from '../../auth/withAuthentication';

export interface ResolverContextType {
    payload: TokenPayload;
    accessToken: string;
}
