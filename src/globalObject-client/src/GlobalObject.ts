import {
    isGlobalObject,
    requestQueue,
    sendAllRequestsWithQueue,
    shouldReSend,
    state,
} from './symbols'
import { connect } from './connect'
import { sendRequests } from './socket'
import { generatePrototype, proxyfy } from './object'
import { RequestData, TGlobalObject } from './types'
import { EMPTY_OBJECT } from './constants'

export class GlobalObject {
    static [requestQueue]: RequestData[] = new Array()
    static [sendAllRequestsWithQueue]() {
        sendRequests(GlobalObject[requestQueue])
    }

    static isGlobalObject<T extends object>(obj: T) {
        return obj && isGlobalObject in obj && obj[isGlobalObject]
    }

    static getState<T extends object>(obj: TGlobalObject<T>) {
        return obj[state]
    }

    static create<T extends object>(obj: T | null): TGlobalObject<T | {}> {
        obj = obj ? structuredClone(obj) : (EMPTY_OBJECT as T)

        const prototype = generatePrototype(obj)

        Object.setPrototypeOf(prototype, Object.getPrototypeOf(obj))

        Object.setPrototypeOf(obj, prototype)

        const res = proxyfy(obj, this)

        res[shouldReSend] = true

        return res
    }

    static config = {
        secure: false,
    }

    static get<T extends object>(
        host: string,
        path = '',
        secure = this.config.secure
    ) {
        return connect<T>(host, path, this, secure)
    }
}
