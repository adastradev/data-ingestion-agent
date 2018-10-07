import { CognitoUserPoolLocator } from "./CognitoUserPoolLocator";
import { CognitoIdentity } from 'aws-sdk'
import { CognitoUserPoolApiModel } from "./CognitoUserPoolApiModel";

global['fetch'] = require('node-fetch');
const CognitoUserPool = require('amazon-cognito-identity-js').CognitoUserPool;
const AuthenticationDetails = require('amazon-cognito-identity-js').AuthenticationDetails;
const CognitoUser = require('amazon-cognito-identity-js').CognitoUser;

export interface CognitoJwtToken {
    idToken: string;
    AccessToken: string;
}

export class AuthManager {
    private locator: CognitoUserPoolLocator;
    private poolData: CognitoUserPoolApiModel;
    private region: string;

    constructor(locator: CognitoUserPoolLocator, region: string) {
        this.locator = locator;
        this.region = region;
    }

    public signIn(email: string, password: string, newPassword:string = ''): Promise<CognitoJwtToken> {
        return new Promise(async function(resolve, reject) {
            // get the pool data from the response
            this.poolData = await this.locator.getPoolForUsername(email);

            // construct a user pool object
            var userPool = new CognitoUserPool(this.poolData);
            // configure the authentication credentials
            var authenticationData = {
                Username: email,
                Password: password
            };
            // create object with user/pool combined
            var userData = {
                Username: email,
                Pool: userPool
            };
            // init Cognito auth details with auth data
            var authenticationDetails = new AuthenticationDetails(authenticationData);
            // authenticate user to in Cognito user pool
            var cognitoUser = new CognitoUser(userData);

            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: function (result) {
                    // get the ID token
                    var idToken = result.getIdToken().getJwtToken();
                    var AccessToken = result.getAccessToken().getJwtToken();
                    var tokens: CognitoJwtToken = {
                        idToken,
                        AccessToken
                    };
                    resolve(tokens);
                },
                onFailure: function(err) {
                    reject(err);
                },
                mfaRequired: function(codeDeliveryDetails) { // eslint-disable-line
                    reject(Error('Multi-factor auth is not currently supported in this library'));
                    // // MFA is required to complete user authentication.
                    // // Get the code from user and call

                    // //MFA is Disabled for this QuickStart. This may be submitted as an enhancement, if there are sufficient requests.
                    // var mfaCode = '';

                    // if (user.mfaCode == undefined){
                    //     res.status(200);
                    //     res.json({mfaRequired: true});
                    //     return;
                    // }
                    // cognitoUser.sendMFACode(mfaCode, this)
                },
                newPasswordRequired: function(userAttributes, requiredAttributes) { // eslint-disable-line
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
                            onSuccess: function (result) {
                                // get the ID token
                                var idToken = result.getIdToken().getJwtToken();
                                var AccessToken = result.getAccessToken().getJwtToken();
                                var tokens: CognitoJwtToken = {
                                    idToken,
                                    AccessToken
                                };
                                resolve(tokens);
                            },
                            onFailure: function(err) {
                                reject(err);
                            }
                        });
                    }
                    else {
                        reject(Error('New password is required for the user'));
                    }
                }
            });
        }.bind(this));
    }

    public getIamCredentials(cognitoIdToken: string): Promise<CognitoIdentity.Credentials> {
        return new Promise(async function(resolve, reject) {
            const authenticator = `cognito-idp.${this.region}.amazonaws.com/${this.poolData.UserPoolId}`;

            var CognitoIdentity = new CognitoIdentity({ region: this.region });
            var params: CognitoIdentity.Types.GetIdInput = {
                IdentityPoolId: this.poolData.IdentityPoolId,
                Logins: {
                    [authenticator]: cognitoIdToken
                }
            }

            var response = await CognitoIdentity.getId(params).promise();

            var getCredentialParams: CognitoIdentity.GetCredentialsForIdentityInput = {
                IdentityId: response.IdentityId,
                Logins: {
                    [authenticator]: cognitoIdToken
                }
            }

            const result = await CognitoIdentity.getCredentialsForIdentity(getCredentialParams).promise();
            resolve(result.Credentials);
        }.bind(this));
    }

}

