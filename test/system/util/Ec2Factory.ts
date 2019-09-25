import * as aws from 'aws-sdk';
import IInstanceConfig from '../IInstanceConfig';
import { TerminateInstancesRequest } from 'aws-sdk/clients/ec2';

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

        const cfg: IInstanceConfig = require('../instanceConfig.json');
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
     * Creates an EC2 instance using the currently configured instance details
     *
     * @param {string} imageType The image type/category to use when determining the correct AMI for the instance
     * @returns {Promise<void>}
     * @memberof Ec2Factory
     */
    public async createTestInstance(imageType: string): Promise<void> {
        if (this.instance) {
            throw new Error(
                'Cannot create another instance, ' +
                `please terminate the existing instance '${this.instance.InstanceId}' first.`);
        }

        this.imageType = imageType;

        const amiId = this.getApplicableAmi(imageType);
        const runInstanceParams = this.config.instance;
        runInstanceParams.ImageId = amiId;

        const results = await this.client.runInstances(runInstanceParams).promise();

        this.instance = results.Instances[0];

        const instanceIdsParam = { InstanceIds: [this.instance.InstanceId]} as any;
        await this.client.waitFor('instanceRunning', instanceIdsParam).promise();
        await this.client.waitFor('instanceStatusOk', instanceIdsParam).promise();

        const describeResult =
            await this.client.describeInstances(instanceIdsParam).promise();

        this.instance = describeResult.Reservations[0].Instances[0];

        if (results.$response.error) {
            const error = results.$response.error;
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

        const params: TerminateInstancesRequest = {
            InstanceIds: [this.instance.InstanceId]
        };

        await this.client.terminateInstances(params).promise();
        await this.client.waitFor('instanceTerminated', params).promise();

        // EBS volumes don't seem to respect the delete on termination instruction
        // in the instance creation config so we must terminate first then wait for
        // the instance to become available before also deleting the volume
        const ebsVolumeId = this.instance.BlockDeviceMappings[0].Ebs.VolumeId;
        await this.client.waitFor('volumeAvailable', { VolumeIds: [ebsVolumeId]});
        await this.client.deleteVolume({ VolumeId: ebsVolumeId }).promise();

        this.instance = null;
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

        for (const regionAmi of this.config.images[imageType].ami_map) {
            if (regionAmi.region === this.config.region) {
                return regionAmi.ami;
            }
        }

        throw new Error(`Failure to find an ami for the specified ragion - '${this.config.instance.region}'`);
    }
}
