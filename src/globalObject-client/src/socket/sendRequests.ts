import { connections } from '../symbols'
import { RequestData } from '../types'

export function sendRequests(requestQueue: RequestData[]) {
    for (const { target, eventName, data } of requestQueue) {
        target[connections]?.forEach((ws) => {
            ws.emit(eventName, data)
        })
    }

    requestQueue.length = 0
}
