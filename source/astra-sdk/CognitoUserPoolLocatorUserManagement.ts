import { ICognitoUserPoolLocator } from './ICognitoUserPoolLocator';
import { UserManagementApi } from './UserManagementApi';
import { ICognitoUserPoolApiModel } from './ICognitoUserPoolApiModel';

export class CognitoUserPoolLocatorUserManagement implements ICognitoUserPoolLocator {
    private region: string;

    constructor(region: string) {
        this.region = region;
    }

    public getPoolForUsername(userName: string): Promise<ICognitoUserPoolApiModel> {
        return new Promise(async function (resolve, reject) {
            const api = new UserManagementApi(process.env.USER_MANAGEMENT_URI, this.region, { type: 'None' });
            const response: any = await api.getUserPoolByUserName(userName);
            const result: ICognitoUserPoolApiModel = {
                ClientId: response.data.cognito_app_client_id,
                IdentityPoolId: response.data.cognito_identity_pool_id,
                UserPoolId: response.data.cognito_user_pool_id
            };

            resolve(result);
        }.bind(this));
    }
}
