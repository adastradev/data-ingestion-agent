import startup from './inversify.config';
import TYPES from './ioc.types';
import { Agent } from './source/Agent';
import fetch from 'fetch-with-proxy';
// tslint:disable-next-line:no-string-literal
global['fetch'] = fetch;

(async () => {
    return await startup();
})().then(async (container) => {
    const agent: Agent = container.get<Agent>(TYPES.Agent);
    await agent.main();
});
