import { CognitoUserPoolApiModel } from "./CognitoUserPoolApiModel";

export interface CognitoUserPoolLocator {
    getPoolForUsername(userName: string): Promise<CognitoUserPoolApiModel>;
}