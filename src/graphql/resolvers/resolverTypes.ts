import { TokenPayload } from '../../auth/withAuthantication';

export interface ResolverContextType {
    payload: TokenPayload;
    accessToken: string;
}
