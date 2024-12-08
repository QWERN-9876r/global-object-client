import { io } from 'socket.io-client'
import type { GlobalObject as GlobalObjectType } from './GlobalObject'
import {
    connections,
    id,
    isGlobalObject,
    shouldReSend,
    state,
    staticObject,
} from './symbols'
import { TGlobalObject } from './types'

interface Add<T extends object> {
    id: string
    current: T
}

interface Remove {
    id: string
}

interface Update<T extends object> {
    id: string
    key: keyof T
    value: T[keyof T]
}

interface AddConnection {
    id: string
    countConnections: number
    hostName: string
}

export function connect<T extends object>(
    host: string,
    path: string,
    GlobalObject: typeof GlobalObjectType,
    secure = false
): Promise<TGlobalObject<T | {}>> {
    let gObj: TGlobalObject<T | {}> = GlobalObject.create(null)

    const ws = io(host + path)

    return new Promise((resolve, reject) => {
        ws.on('add', (data: Add<T>) => {
            try {
                if (gObj[isGlobalObject] || gObj[state] !== 'created') return

                gObj[shouldReSend] = false
                gObj = GlobalObject.create(
                    'current' in data ? data.current : null
                )

                gObj[connections].push(ws)

                if (!gObj)
                    reject(
                        new Error(
                            'GlobalObject: Failed to create global object'
                        )
                    )

                gObj[id] = data.id
                gObj[shouldReSend] = true

                resolve(gObj)
            } catch (e) {
                reject(e)
            }
        })
        ws.on('disconnect', () => {
            gObj.remove()
        })
        ws.on('update', (data: Update<T>) => {
            if (!('key' in data))
                throw new Error(
                    'GlobalObject: request with type update should has property key'
                )
            if (!gObj || !gObj[staticObject]) {
                ;(gObj as TGlobalObject<T>)[staticObject] = {
                    [data.key]: data.value,
                } as T

                reject(
                    new Error(
                        'GlobalObject: attempt to update an object before adding it'
                    )
                )
            }

            gObj[shouldReSend] = false
            Reflect.set(gObj, data.key, data.value)
            gObj[shouldReSend] = true
        })
        ws.on('remove', (data: Remove) => {
            if (!gObj || data.id !== gObj[id]) return

            gObj.remove()
        })

        ws.on('addConnection', (data: AddConnection) => {
            if (
                !gObj ||
                data.id !== gObj[id] ||
                data.countConnections <= gObj[connections].length
            )
                return

            gObj[shouldReSend] = false

            connect(data.hostName, '', GlobalObject, secure)

            gObj[shouldReSend] = true
        })
    })
}
