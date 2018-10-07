import { CognitoUserPoolLocator } from './CognitoUserPoolLocator';
import { UserManagementApi } from './UserManagementApi';
import { CognitoUserPoolApiModel } from './CognitoUserPoolApiModel';

export class CognitoUserPoolLocatorUserManagement implements CognitoUserPoolLocator {
    private region: string;

    constructor(region: string) {
        this.region = region;
    }

    public getPoolForUsername(userName: string): Promise<CognitoUserPoolApiModel> {
        return new Promise(async function(resolve, reject) {
            let api = new UserManagementApi(process.env.USER_MANAGEMENT_URI, this.region, { type: 'None' });
            const response: any = await api.getUserPoolByUserName(userName);
            let result: CognitoUserPoolApiModel = JSON.parse(response.body);
            resolve(result);
        });
    }
}