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
        var normalized_docker_tag = process.env.NORMALIZED_DOCKER_TAG;
        return [`sudo docker pull adastradev/data-ingestion-agent:${normalized_docker_tag}`];
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
        var aws_access_key = process.env.AWS_ACCESS_KEY_ID;
        var aws_secret_access_key = process.env.AWS_SECRET_ACCESS_KEY;
        var sqs_queue_uri = process.env.SQS_QUEUE_URI;
        return [[
            'sudo docker run',
            '--name dia',
            '-d',
            '-t',
            `-e AWS_ACCESS_KEY_ID=${aws_access_key}`,
            `-e AWS_SECRET_ACCESS_KEY=${aws_secret_access_key}`,
            `-e SQS_QUEUE_URI=${sqs_queue_uri}`,
            'adastradev/data-ingestion-agent:feature_pipeline'
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