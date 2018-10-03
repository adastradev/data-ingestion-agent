import * as aws from 'aws-sdk';
import InstanceConfig from '../InstanceConfig';

/**
 * Manages EC2 instance creation and teardown
 *
 * @export
 * @class Ec2Factory
 */
export default class Ec2Factory {

    private client: aws.EC2;
    private config: any;
    private instance: aws.EC2.Instance;
    private imageType: string;

    constructor() {
        
        let cfg: InstanceConfig = require('../instanceConfig.json');
        this.config = cfg;

        this.client = new aws.EC2({ apiVersion: '2016-11-15', region: this.config.region });
    }

    /**
     * Return the instance information of the current running EC2 instance
     *
     * @readonly
     * @type {aws.EC2.Instance}
     * @memberof Ec2Factory
     */
    get currentInstance(): aws.EC2.Instance {
        return this.instance;
    }


    /**
     * Returns the assigned default user related to the AMI of the instance
     *
     * @returns {string}
     * @memberof Ec2Factory
     */
    public getRootUser(): string {
        if (!this.instance) {
            throw new Error('Cannot find a root user because no instance has been started; please create one first');
        }

        return this.config.images[this.imageType].root_user;
    }

    /**
     * Given the image category/image type return the AMI identifier for the currently configured region
     *
     * @private
     * @param {string} imageType The image type or category in which to search for an appropriate AMI
     * @returns {string} The AMI identifier
     * @memberof Ec2Factory
     */
    private getApplicableAmi(imageType: string): string {

        if (!this.config.images[imageType]) {
            throw new Error(`Failure to find a configuration for the specified image type of '${imageType}'`);
        }

        for(var regionAmi of this.config.images[imageType].ami_map) {
            if (regionAmi.region === this.config.region) {
                return regionAmi.ami;
            }
        }

        throw new Error(`Failure to find an ami for the specified ragion - '${this.config.instance.region}'`)
    }

    /**
     * Creates an EC2 instance using the currently configured instance details
     *
     * @param {string} imageType The image type/category to use when determining the correct AMI for the instance
     * @returns {Promise<void>}
     * @memberof Ec2Factory
     */
    public async createTestInstance(imageType: string): Promise<void> {
        
        if (this.instance) {
            throw new Error(`Cannot create another instance, please terminate the existing instance '${this.instance.InstanceId}' first.`)
        }

        this.imageType = imageType;
        
        var params = this.config.instance;

        var amiId = this.getApplicableAmi(imageType);
        params.ImageId = amiId;

        var results = await this.client.runInstances(params).promise();

        var params = <any>{ InstanceIds: [results.Instances[0].InstanceId]};
        this.instance = results.Instances[0];

        await this.client.waitFor("instanceRunning", params).promise();
        await this.client.waitFor("instanceStatusOk", params).promise();

        var describeResult = await this.client.describeInstances({ InstanceIds: [this.instance.InstanceId]}).promise();

        this.instance = describeResult.Reservations[0].Instances[0];

        if (results.$response.error) { 
            var error = results.$response.error;
            console.log(error, error.stack); 
        }
    }

    /**
     * Terminates the current instance
     *
     * @returns {Promise<void>}
     * @memberof Ec2Factory
     */
    public async removeTestInstance(): Promise<void> {
        if (!this.instance) {
            throw new Error('Cannot terminate a non-existant image; please create one first');
        }

        var params = {
            InstanceIds: [this.instance.InstanceId]
        };

        await this.client.terminateInstances(params).promise();

        this.instance = null;
    }
}