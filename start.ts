import * as express from 'express';
import * as shell from 'child_process';

// start agent process
var child = shell.spawn('node', ['dist/index.js']);

var childState = {status: 'running'};
child.on('exit', (code, signal) => {
    childState.status = 'exited';
});

// start server
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    if (childState.status === 'running') {
        res.status(200);
    } else {
        res.status(500);
    }

    res.send(childState.status);
});
app.listen(port, () => console.log('healthcheck server'));