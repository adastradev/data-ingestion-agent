import { ICognitoUserPoolApiModel } from './ICognitoUserPoolApiModel';

export interface ICognitoUserPoolLocator {
    getPoolForUsername(userName: string): Promise<ICognitoUserPoolApiModel>;
}
