import * as SQS from 'aws-sdk/clients/sqs';
import * as Winston from 'winston';

async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

class Startup {
    public static async main(): Promise<number> {

        const logger = Winston.createLogger({
            level: 'info',
            format: Winston.format.json(),
            transports: [
                new Winston.transports.Console()
            ]
        });

        logger.log('info', 'waiting for sqs schedule event');
        
        var sqsConfig = { apiVersion: '2012-11-05', region: 'us-east-1'};
        
        // TODO: Change to better authentication scheme
        if (process.env.AWS_ACCESS_KEY && process.env.AWS_SECRET_ACCESS_KEY) {
            
            logger.log('info', 'Configuring security credentials');
            
            const awsAccessKey = process.env.AWS_ACCESS_KEY;
            const awsSecretKey = process.env.AWS_SECRET_ACCESS_KEY;

            Object.assign(sqsConfig, { accessKeyId: awsAccessKey, secretAccessKey: awsSecretKey });
        }

        var sqs = new SQS(sqsConfig);

        // TODO: Discover this value per tenant
        const queueUrl = process.env.SQS_QUEUE_URI;
        while(true) {

            await sleep(1000);
            
            var result = await sqs.receiveMessage({ QueueUrl: queueUrl, MaxNumberOfMessages: 1}).promise();

            if (result.Messages) {
                logger.log('info', `Schedule Signal Received - ${result.Messages[0].Body}`);      

                logger.log('info', 'Ingesting...');


                await sleep(1000);

                logger.log('info', 'Done Ingesting!');

                // ack
                await sqs.deleteMessage({ QueueUrl: queueUrl, ReceiptHandle: result.Messages[0].ReceiptHandle }).promise();
                
                // Debug hack for now
                if (result.Messages[0].Body === 'failme') {
                    throw Error('Fail');
                }
            }
        }
    }
}

Startup.main();