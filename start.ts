import * as express from 'express';
import * as shell from 'child_process';

// optional args
var args = process.argv.slice(2);
var target = ['dist/index.js'].concat(args);

// start agent process
var child = shell.spawn('node', target);
child.unref(); // apparently detangles event loop of the child from the parent
child.stdout.on('data', function(data) {
    console.log(data.toString());
});
child.stderr.on('data', function(data) {
    console.log(data.toString());
});

var childState = {status: 'running'};
child.on('exit', (code, signal) => {
    childState.status = 'exited';
    
    if (args[0] === "preview") {
        if (server) {
            server.close();
        }
    }
});

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
var server = app.listen(port, () => console.log('healthcheck server'));
process.on('SIGTERM', function() {
    child.kill("SIGTERM");
    server.close();
});