import StartController from './source/StartController';

// optional args
const args = process.argv.slice(2);
const startController = new StartController(args, 4000);
startController.spawnAgent();
startController.startHealthCheckServer();
