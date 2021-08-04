import { TokenSet } from 'openid-client';

export interface ViewerModel {
    personNummer: string;
}

export interface ResolverContextType {
    tokenSet: TokenSet;
}
