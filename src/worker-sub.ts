import { fromEventPattern, Observable, asyncScheduler } from 'rxjs';
import { filter, observeOn } from 'rxjs/operators';
import MyWorker from 'worker-loader!./workers/demo.worker';
import { WorkerMessage, WorkerMessageEvent } from './models/WorkerInterface';

console.log('MyWorker', MyWorker);

// HELPERS
const fromWorkerEvent = (worker: Worker, options?: any): Observable<any> => {
    const eventName: string = options && options.event ? options.event : 'message';

    return fromEventPattern(
        (handler: any) => worker.addEventListener(eventName, handler),
        (handler: any) => worker.removeEventListener(eventName, handler)
    ).pipe(observeOn(asyncScheduler));
};

// WORKER

const worker = new MyWorker();
const workerMessage$: Observable<WorkerMessageEvent> = fromWorkerEvent(worker);

document.addEventListener('DOMContentLoaded', () => {
    workerMessage$
        .pipe(filter((emit: WorkerMessageEvent) => emit.data.action === '/api/todos/'))
        .subscribe((emit: WorkerMessageEvent) => {
            console.log('message', emit);
        });

    worker.postMessage({ action: '/api/todos/' } as WorkerMessage);
});
