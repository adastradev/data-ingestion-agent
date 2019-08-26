import { ICognitoUserPoolLocator } from './ICognitoUserPoolLocator';
import { UserManagementApi } from './UserManagementApi';
import { ICognitoUserPoolApiModel } from './ICognitoUserPoolApiModel';

/**
 * Locates a cognito user pool appropriate for a given username via REST lookup against the
 * user management api
 */
export class CognitoUserPoolLocatorUserManagement implements ICognitoUserPoolLocator {
    constructor(private region: string) {
    }

    public getPoolForUsername(userName: string): Promise<ICognitoUserPoolApiModel> {
        return new Promise(async function (resolve, reject) {
            const api = new UserManagementApi(process.env.USER_MANAGEMENT_URI, this.region, { type: 'None' });

            try {
                const response: any = await api.getUserPoolByUserName(userName);
                const result: ICognitoUserPoolApiModel = {
                    ClientId: response.data.cognito_app_client_id,
                    IdentityPoolId: response.data.cognito_identity_pool_id,
                    UserPoolId: response.data.cognito_user_pool_id
                };
                resolve(result);
            } catch (error) {
                reject(error);
            }
        }.bind(this));
    }
}
