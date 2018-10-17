import { ICognitoUserPoolLocator } from './CognitoUserPoolLocator';
import * as AWS from 'aws-sdk';
import { ICognitoUserPoolApiModel } from './CognitoUserPoolApiModel';
import { AuthenticationDetails, CognitoUser, CognitoUserPool, CognitoUserSession } from 'amazon-cognito-identity-js';

// tslint:disable-next-line:no-string-literal no-var-requires
global['fetch'] = require('node-fetch');

export class AuthManager {
    private locator: ICognitoUserPoolLocator;
    private poolData: ICognitoUserPoolApiModel;
    private region: string;
    private cognitoUser: CognitoUser;
    private cognitoUserSession: CognitoUserSession;

    constructor(locator: ICognitoUserPoolLocator, region: string) {
        this.locator = locator;
        this.region = region;
    }

    public signIn(email: string, password: string, newPassword: string = ''): Promise<CognitoUserSession> {
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
            this.cognitoUser = new CognitoUser(userData);

            const that = this;
            this.cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess(result) {
                    that.cognitoUserSession = result;
                    resolve(result);
                },
                onFailure(err) {
                    reject(err);
                },
                mfaRequired(codeDeliveryDetails) { // eslint-disable-line
                    // MFA is Disabled for this QuickStart.
                    reject(Error('Multi-factor auth is not currently supported in this agent'));
                },
                newPasswordRequired(userAttributes, requiredAttributes) { // eslint-disable-line
                    reject(Error('New password is required for this user'));
                }
            });
        }.bind(this));
    }

    public refreshCognitoCredentials() {
        return new Promise(async function (resolve, reject) {
            const cognitoIdentityCredentials = AWS.config.credentials as AWS.CognitoIdentityCredentials;
            if (cognitoIdentityCredentials.needsRefresh()) {
                const authenticator = `cognito-idp.${this.region}.amazonaws.com/${this.poolData.UserPoolId}`;
                const that = this;
                // tslint:disable-next-line:max-line-length
                this.cognitoUser.refreshSession(this.cognitoUserSession.getRefreshToken(), (refreshCognitoErr, newSession) => {
                    if (refreshCognitoErr) {
                        console.log(refreshCognitoErr);
                    } else {
                        that.cognitoUserSession = newSession;
                        // tslint:disable-next-line:no-string-literal max-line-length
                        cognitoIdentityCredentials.params['Logins'][authenticator]  = newSession.getIdToken().getJwtToken();
                        cognitoIdentityCredentials.refresh((refreshIamErr) => {
                            if (refreshIamErr) {
                                console.log(refreshIamErr);
                            } else {
                                console.log('TOKEN SUCCESSFULLY UPDATED');
                            }
                        });
                    }
                });
            }
        }.bind(this));
    }

    public configureIamCredentials() {
        return new Promise(async function (resolve, reject) {
            const authenticator = `cognito-idp.${this.region}.amazonaws.com/${this.poolData.UserPoolId}`;
            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId : this.poolData.IdentityPoolId,
                Logins : {
                    [authenticator] : this.cognitoUserSession.getIdToken().getJwtToken()
                }
            });
            resolve(true);
        }.bind(this));
    }
}
