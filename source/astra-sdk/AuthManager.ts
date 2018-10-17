// tslint:disable:no-var-requires
import { CognitoUserPoolLocator } from './CognitoUserPoolLocator';
import { CognitoIdentity } from 'aws-sdk';
import * as AWS from 'aws-sdk';
import { CognitoUserPoolApiModel } from './CognitoUserPoolApiModel';

// tslint:disable-next-line:no-string-literal
global['fetch'] = require('node-fetch');
const CognitoUserPool = require('amazon-cognito-identity-js').CognitoUserPool;
const AuthenticationDetails = require('amazon-cognito-identity-js').AuthenticationDetails;
const CognitoUser = require('amazon-cognito-identity-js').CognitoUser;

export interface CognitoJwtToken {
    idToken: string;
    accessToken: string;
}

export class AuthManager {
    private locator: CognitoUserPoolLocator;
    private poolData: CognitoUserPoolApiModel;
    private region: string;

    constructor(locator: CognitoUserPoolLocator, region: string) {
        this.locator = locator;
        this.region = region;
    }

    public signIn(email: string, password: string, newPassword: string = ''): Promise<CognitoJwtToken> {
        return new Promise(async function (resolve, reject) {
            // get the pool data from the response
            this.poolData = await this.locator.getPoolForUsername(email);

            // construct a user pool object
            const userPool = new CognitoUserPool(this.poolData);
            // configure the authentication credentials
            const authenticationData = {
                Password: password,
                Username: email
            };
            // create object with user/pool combined
            const userData = {
                Pool: userPool,
                Username: email
            };
            // init Cognito auth details with auth data
            const authenticationDetails = new AuthenticationDetails(authenticationData);
            // authenticate user to in Cognito user pool
            const cognitoUser = new CognitoUser(userData);

            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess (result) {
                    // get the ID token
                    const idToken = result.getIdToken().getJwtToken();
                    const accessToken = result.getAccessToken().getJwtToken();
                    const tokens: CognitoJwtToken = {
                        accessToken,
                        idToken
                    };
                    resolve(tokens);
                },
                onFailure(err) {
                    reject(err);
                },
                mfaRequired(codeDeliveryDetails) { // eslint-disable-line
                    reject(Error('Multi-factor auth is not currently supported in this library'));
                    // //MFA is Disabled for this QuickStart.
                    // var mfaCode = '';

                    // if (user.mfaCode == undefined){
                    //     res.status(200);
                    //     res.json({mfaRequired: true});
                    //     return;
                    // }
                    // cognitoUser.sendMFACode(mfaCode, this)
                },
                newPasswordRequired(userAttributes, requiredAttributes) { // eslint-disable-line
                    if (newPassword !== undefined && newPassword.length > 0) {
                        // User was signed up by an admin and must provide new
                        // password and required attributes, if any, to complete
                        // authentication.
                        // if (user.newPassword == undefined){
                        //     res.status(200);
                        //     res.json({newPasswordRequired: true});
                        //     return;
                        // }
                        // These attributes are not mutable and should be removed from map.
                        delete userAttributes.email_verified;
                        delete userAttributes['custom:tenant_id'];
                        cognitoUser.completeNewPasswordChallenge(newPassword, userAttributes, {
                            onSuccess (result) {
                                // get the ID token
                                const idToken = result.getIdToken().getJwtToken();
                                const accessToken = result.getAccessToken().getJwtToken();
                                const tokens: CognitoJwtToken = {
                                    accessToken,
                                    idToken
                                };
                                resolve(tokens);
                            },
                            onFailure(err) {
                                reject(err);
                            }
                        });
                    } else {
                        reject(Error('New password is required for the user'));
                    }
                }
            });
        }.bind(this));
    }

    public getIamCredentials(cognitoIdToken: string): Promise<CognitoIdentity.Credentials> {
        return new Promise(async function (resolve, reject) {
            const authenticator = `cognito-idp.${this.region}.amazonaws.com/${this.poolData.UserPoolId}`;

            const cognitoIdentity = new AWS.CognitoIdentity({ region: this.region });
            const params: CognitoIdentity.Types.GetIdInput = {
                IdentityPoolId: this.poolData.IdentityPoolId,
                Logins: {
                    [authenticator]: cognitoIdToken
                }
            };

            const response = await cognitoIdentity.getId(params).promise();

            const getCredentialParams: CognitoIdentity.GetCredentialsForIdentityInput = {
                IdentityId: response.IdentityId,
                Logins: {
                    [authenticator]: cognitoIdToken
                }
            };

            const result = await cognitoIdentity.getCredentialsForIdentity(getCredentialParams).promise();
            resolve(result.Credentials);
        }.bind(this));
    }

}
