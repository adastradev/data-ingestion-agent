import StartController from './source/StartController';

// optional args
const args = process.argv.slice(2);

for (const a of process.argv) {
    console.log(a);
}
const startController = new StartController(args, 4000);
startController.spawnAgent();
startController.startHealthCheckServer();
