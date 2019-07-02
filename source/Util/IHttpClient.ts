export interface IHttpClient {
    defaultAdditionalParams: any;
    invokeApi(params: any, pathTemplate: any, method: any, additionalParams: any, body: any): Promise<any>;
}
