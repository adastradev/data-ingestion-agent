import * as http from 'http';
export function requestHandler(res: http.IncomingMessage) {
    console.log(`STATUS: ${res.statusCode}`);
    if (res.statusCode === 200) {
        process.exit(0);
    } else {
        process.exit(1);
    }
}

export function errorHandler(err) {
    console.log('ERROR');
    process.exit(1);
}
