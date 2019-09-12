import * as express from 'express';
import * as shell from 'child_process';
import cli from './cli/cli';

// optional args
const args = process.argv.slice(2);

(async () => {
    try {
        const continueWithStartup = await cli(args);

        if (continueWithStartup) {
            if (!process.env.PROCESS_MAX_MEMORY_SIZE_MB) {
                throw Error('PROCESS_MAX_MEMORY_SIZE_MB environment variable is required but was not specified');
            }

            // allow space for the kernel
            const nodeProcessMaxSpaceSize: number = Math.round((process.env.PROCESS_MAX_MEMORY_SIZE_MB as any) * 0.75);
            const target = [`--max-old-space-size=${nodeProcessMaxSpaceSize}`, 'dist/index.js'].concat(args);
            let restartCounter = 0;
            let child;

            const onExitHandler = (code, signal) => {
                restartCounter++;

                console.log(`Agent Process exited with code ${code}; signal: ${signal}`);

                if (restartCounter < 5 && !args[0]) {
                    child = spawnAgent();
                } else {
                    if (!args[0]) {
                        console.log(`Retry max encountered, exiting.`);
                    }
                    childState.status = 'exited';
                }

                if (args[0]) {
                    if (server) {
                        server.close();
                    }
                }
            };

            const spawnAgent = () => {
                // start agent process
                child = shell.spawn('node', target);
                child.unref(); // apparently detangles event loop of the child from the parent
                child.stdout.on('data', (data) => {
                    console.log(data.toString());
                });
                child.on('exit', onExitHandler);
                child.stderr.on('data', (data) => {
                    console.log(data.toString());
                });
                return child;
            };

            child = spawnAgent();
            const childState = {status: 'running'};

            // start server
            const app = express();
            const port = 4000;

            app.get('/', (req, res) => {
                if (childState.status === 'running') {
                    res.status(200);
                } else {
                    res.status(500);
                }

                res.send(childState.status);
            });

            const server = app.listen(port, () => console.log('healthcheck server'));
            process.on('SIGTERM', () => {
                child.kill('SIGTERM');
                server.close();
            });
        }
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
})();
