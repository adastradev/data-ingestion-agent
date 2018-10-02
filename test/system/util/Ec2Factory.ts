import * as aws from 'aws-sdk';
import InstanceConfig from '../InstanceConfig';

export default class Ec2Factory {

    private client: aws.EC2;
    private config: any;
    private instance: aws.EC2.Instance;

    constructor() {
        
        let cfg: InstanceConfig = require('../instanceConfig.json');
        this.config = cfg;

        this.client = new aws.EC2({ apiVersion: '2016-11-15', region: this.config.region });
    }

    private getApplicableAmi(): string {
        for(var regionAmi of this.config.images) {
            if (regionAmi.region === this.config.region) {
                return regionAmi.ami;
            }
        }

        throw new Error(`Failure to find an ami for the specified ragion - '${this.config.instance.region}'`)
    }

    /**
     * Creates an EC2 instance for testing.
     */
    public async createTestInstance(): Promise<void> {        
        var params = this.config.instance;

        var amiId = this.getApplicableAmi();
        params.ImageId = amiId;

        var results = await this.client.runInstances(params).promise();

        var params = <any>{ InstanceIds: [results.Instances[0].InstanceId]};
        this.instance = results.Instances[0];

        await this.client.waitFor("instanceRunning", params).promise();
        await this.client.waitFor("instanceStatusOk", params).promise();

        if (results.$response.error) { 
            var error = results.$response.error;
            console.log(error, error.stack); 
        }
        else {
            console.log(`Created instance - ${this.instance.InstanceId}`); 
        }
    }

    public async removeTestInstance(): Promise<void> {
        var params = {
            InstanceIds: [this.instance.InstanceId]
        };

        await this.client.terminateInstances(params).promise();
    }
}