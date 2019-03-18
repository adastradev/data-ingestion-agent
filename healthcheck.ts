import * as http from 'http';
import { errorHandler, requestHandler  } from './source/healthCheckHandler';

const options = {
    host : 'localhost',
    port : '4000',
    timeout : 2000
};

const request = http.request(options, requestHandler);

request.on('error', errorHandler);

request.end();
