import { WorkerMessageEvent, WorkerMessageEventData } from '../models/WorkerInterface';
import axios from 'axios';

const ctx: Worker = self as any;

ctx.onmessage = async (event: WorkerMessageEvent) => {
    if (typeof event.data.action !== 'string') {
        return;
    }
    console.log('worker', event)
    switch (event.data.action) {
        case '/api/todos/':
            const result = await axios.get(
                'https://jsonplaceholder.typicode.com/todos'
            );

            const message: WorkerMessageEventData = {result: result.data, action: event.data.action}
            ctx.postMessage(message);

            break;
        default:
            throw `worker topic unsuported ${event.data.action}`;
    }
};
