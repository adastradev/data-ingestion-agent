import { ICognitoUserPoolApiModel } from './CognitoUserPoolApiModel';

export interface ICognitoUserPoolLocator {
    getPoolForUsername(userName: string): Promise<ICognitoUserPoolApiModel>;
}
