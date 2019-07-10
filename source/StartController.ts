import * as express from 'express';
import * as shell from 'child_process';
import { Server } from 'http';

/**
 * Manages the running of the ingestion agent and failure recovery logic
 *
 * @export
 * @class StartController
 */
export default class StartController {
    private restartCounter: number;
    private child: shell.ChildProcess;
    private childState: any = { status: 'notrunning' };
    private server: Server;

    constructor (
        private readonly processArgs: any[],
        private readonly healthCheckPort: number) {
        this.restartCounter = 0;
    }

    /**
     * Attempts to spawn a new instance of the ingestion agent
     * as an independent process.
     *
     * @memberof StartController
     */
    public spawnAgent() {
        const nodeProcessMaxSpaceSize: number = Math.round((process.env.PROCESS_MAX_MEMORY_SIZE_MB as any) * 0.75);
        const target = [`--max-old-space-size=${nodeProcessMaxSpaceSize}`, 'dist/index.js'].concat(this.processArgs);
        // start agent process
        const child = shell.spawn('node', target);
        child.unref(); // apparently detangles event loop of the child from the parent
        child.stdout.on('data', (data) => {
            console.log(data.toString());
        });
        child.on('exit', this.onExitHandler);
        child.stderr.on('data', (data) => {
            console.log(data.toString());
        });
        this.child = child;
    }

    /**
     * A simple http server pinged by Docker to check the health of
     * the agent. We report back the status depending on what state
     * our child process (the agent) is in.
     *
     * @memberof StartController
     */
    public startHealthCheckServer() {
        const app: express.Application = express();
        const port = this.healthCheckPort;

        app.get('/', (req, res) => {
            if (this.childState.status === 'running') {
                res.status(200);
            } else {
                res.status(500);
            }

            res.send(this.childState.status);
        });

        this.server = app.listen(port, () => console.log('healthcheck server'));
        process.on('SIGTERM', () => {
            if (this.child) {
                this.child.kill('SIGTERM');
            }
            this.server.close();
        });
    }

    /**
     * Stops the http server
     *
     * @memberof StartController
     */
    public stopHealthCheckServer() {
        if (this.server) {
            this.server.close();
        }
    }

    /**
     * Provides some smart logic around attempting to recover
     * from failures within the agent up to a certain limit of retries.
     *
     * @private
     * @param {*} code The exit code of the previous process
     * @param {*} signal The specific exit signal associated with the process exit event
     * @memberof StartController
     */
    private onExitHandler(code, signal) {
        this.restartCounter++;

        console.log(`Agent Process exited with code ${code}; signal: ${signal}`);

        if (this.restartCounter < 5 && !this.processArgs[0]) {
            this.spawnAgent();
        } else {
            if (!this.processArgs[0]) {
                console.log(`Retry max encountered, exiting.`);
            }
            this.childState.status = 'exited';
        }

        if (this.processArgs[0]) {
            if (this.server) {
                this.server.close();
            }
        }
    }
}
