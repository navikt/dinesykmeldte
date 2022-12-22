import { BaseContext } from '@apollo/server'

import { TokenPayload } from '../../auth/withAuthentication'

export interface ResolverContextType extends BaseContext {
    payload: TokenPayload
    accessToken: string
}
