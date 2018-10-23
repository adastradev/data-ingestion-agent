// tslint:disable:max-classes-per-file

import ICommand from '../ICommand';

/**
 * Pull the appropriate latest version of the published data ingestion agent docker image
 *
 * @export
 * @class PullLatestDockerImageCommand
 * @implements {ICommand<string>}
 */
export class PullLatestDockerImageCommand implements ICommand<string> {
    public getCommands(): Iterable<string> {
        const normalizedDockerTag = process.env.NORMALIZED_DOCKER_TAG;
        return [`sudo docker pull adastradev/data-ingestion-agent:${normalizedDockerTag}`];
    }
}

/**
 * Pull the appropriate latest version of the published data ingestion agent docker image
 *
 * @export
 * @class PullLatestDockerImageCommand
 * @implements {ICommand<string>}
 */

export class StopAndRemoveContainerCommand implements ICommand<string> {
    public getCommands(): Iterable<string> {
        const normalizedDockerTag = process.env.NORMALIZED_DOCKER_TAG;
        return [
            'sudo docker stop dia',
            'sudo docker rm dia'
        ];
    }
}

/**
 * Run the ingestion agent as a long running container
 *
 * @export
 * @class RunDataIngestionAgent
 * @implements {ICommand<string>}
 */
export class RunDataIngestionAgent implements ICommand<string> {
    public getCommands(): Iterable<string> {
        const astraCloudUserName = process.env.ASTRA_CLOUD_USERNAME;
        const astraCloudPassword = process.env.ASTRA_CLOUD_PASSWORD;
        const normalizedDockerTag = process.env.NORMALIZED_DOCKER_TAG;

        return [[
            'sudo docker run',
            '--name dia',
            '-d',
            '-t',
            `-e ASTRA_CLOUD_USERNAME=${astraCloudUserName}`,
            `-e ASTRA_CLOUD_PASSWORD=${astraCloudPassword}`,
            `-e INTEGRATION_TYPE=Demo`,
            `adastradev/data-ingestion-agent:${normalizedDockerTag}`
        ].join(' ')];
    }
}

/**
 * Run the ingestion agent in interactive mode to preview queries used by the agent
 *
 * @export
 * @class RunDataIngestionAgentWithPreview
 * @implements {ICommand<string>}
 */
export class RunDataIngestionAgentWithPreview implements ICommand<string> {
    public getCommands(): Iterable<string> {
        const astraCloudUserName = process.env.ASTRA_CLOUD_USERNAME;
        const astraCloudPassword = process.env.ASTRA_CLOUD_PASSWORD;
        const normalizedDockerTag = process.env.NORMALIZED_DOCKER_TAG;

        return [[
            'sudo docker run',
            '--name dia',
            '-i',
            `-e ASTRA_CLOUD_USERNAME=${astraCloudUserName}`,
            `-e ASTRA_CLOUD_PASSWORD=${astraCloudPassword}`,
            `-e INTEGRATION_TYPE=Demo`,
            `adastradev/data-ingestion-agent:${normalizedDockerTag}`,
            'preview'
        ].join(' ')];
    }
}

/**
 * Retrieve the health description of the data ingestion agent container from docker
 *
 * @export
 * @class InspectHealthStatusCommand
 * @implements {ICommand<string>}
 */
export class InspectHealthStatusCommand implements ICommand<string> {
    public getCommands(): Iterable<string> {
        return ["sudo docker inspect --format='{{json .State.Health.Status}}' dia"];
    }
}
