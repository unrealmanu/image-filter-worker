export interface WorkerMessage {
    action: string;
    options?: any;
}

export interface WorkerMessageEventData {
    action: string;
    result: any;
}

export interface WorkerMessageEvent extends MessageEvent {
    data: WorkerMessageEventData;
}

export interface WorkerMessageEventImageHandling extends MessageEvent {
    data: WorkerMessageEventDataImageDataHandling;
}

export interface WorkerMessageEventDataImageDataHandling extends WorkerMessage {
    imageData: ImageData;
}
