import { ICognitoUserPoolLocator } from './ICognitoUserPoolLocator';
import { ICognitoUserPoolApiModel } from './ICognitoUserPoolApiModel';

/**
 * Static Cognito pool configuration that is used as a singleton for all users
 */
export class CognitoUserPoolLocatorStatic implements ICognitoUserPoolLocator {
    constructor(private userPoolId: string, private clientId: string, private identityPoolId: string) {
    }

    public getPoolForUsername(userName: string): Promise<ICognitoUserPoolApiModel> {
        return new Promise(async function (resolve, reject) {
            const result: ICognitoUserPoolApiModel = {
                ClientId: this.clientId,
                IdentityPoolId: this.identityPoolId,
                UserPoolId: this.userPoolId
            };

            resolve(result);
        }.bind(this));
    }
}
