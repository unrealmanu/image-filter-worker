import { Observable, fromEventPattern, asyncScheduler, fromEvent, OperatorFunction, Observer, of } from 'rxjs';
import { filter, observeOn, pluck, tap } from 'rxjs/operators';
import image from './../assets/img/foto.jpg';
import { WorkerMessageEventImageHandling } from './models/WorkerInterface';
import imageDataHandlingWorker from 'worker-loader!./workers/imageDataHandling.worker';

// HELPER
const fromWorkerEvent = (worker: Worker, options?: any): Observable<any> => {
    const eventName: string = options && options.event ? options.event : 'message';

    return fromEventPattern(
        (handler: any) => worker.addEventListener(eventName, handler),
        (handler: any) => worker.removeEventListener(eventName, handler)
    ).pipe(observeOn(asyncScheduler));
};

// WORKER
const imageWorker = new imageDataHandlingWorker();
const imageWorker$: Observable<WorkerMessageEventImageHandling> = fromWorkerEvent(imageWorker);

// RXJS CUSTOM OPERATORS
function getImageData<HTMLImageElement, ImageData>(): OperatorFunction<HTMLImageElement, ImageData> {
    return function (image: Observable<HTMLImageElement>): Observable<ImageData> {
        return new Observable<ImageData>((observer: Observer<ImageData>) => {
            image.subscribe((image: any) => {
                try {
                    const canvas: HTMLCanvasElement = document.createElement('canvas') as HTMLCanvasElement;
                    const ctx: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
                    const width: number = image.naturalWidth;
                    const height: number = image.naturalHeight;
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(image, 0, 0, width, height);
                    //@ts-ignore
                    const imageData: ImageData = ctx.getImageData(0, 0, width, height);
                    observer.next(imageData);
                    observer.complete();
                } catch (err: any) {
                    observer.error(new Error(err));
                }
            });
        });
    };
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    imageWorker$
        .pipe(filter((emit: WorkerMessageEventImageHandling) => (emit.data.action.match(/^\/filter/) || []).length > 0))
        .subscribe((emit: WorkerMessageEventImageHandling) => {
            if (ctx) {
                ctx.putImageData(emit.data.imageData, 0, 0);
            } else {
                console.error('canvas ctx not exists');
            }
        });

    if (canvas) {
        const img: HTMLImageElement = document.createElement('img');

        fromEvent(img, 'load')
            .pipe(
                pluck('target'),
                tap((img: EventTarget | null) => {
                    const currentTarget = img as HTMLImageElement;
                    if (currentTarget) {
                        canvas.width = currentTarget.naturalWidth;
                        canvas.height = currentTarget.naturalHeight;
                    } else {
                        console.error('fail to set canvas image size');
                    }
                }),
                getImageData()
            )
            .subscribe((imageData: any) => {
                imageWorker.postMessage({ action: '/filter/sepia/', imageData: imageData as ImageData });
            });

        img.src = image;
    }
});
