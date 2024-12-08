import { EMPTY_OBJECT } from '../constants'
import { makeEvent } from '../listeners'
import {
    connections,
    events,
    id,
    isGlobalObject,
    shouldReSend,
    state,
    staticObject,
} from '../symbols'
import { Events, Prototype, TGlobalObject } from '../types'
import { v7 as uuid } from 'uuid'

function getStaticObject<T extends object>(
    this: TGlobalObject<TGlobalObject<T>>
) {
    return this[staticObject]
}

function addEventListener<T extends object>(
    this: TGlobalObject<TGlobalObject<T>>,
    eventName: keyof Events,
    listener: Function
) {
    this[events][eventName].push(listener)
}

function remove<T extends object>(this: TGlobalObject<TGlobalObject<T>>) {
    makeEvent(this, 'remove')

    this[connections].forEach((ws) => {
        ws.emit('remove', {
            id: this[id],
        })
        ws.close()
    })
    this[connections].length = 0
    this[state] = 'deleted'

    this[staticObject] = null
}

function localeRemove<T extends object>(this: TGlobalObject<TGlobalObject<T>>) {
    makeEvent(this, 'remove')

    this[connections].forEach((ws) => {
        ws.close()
    })
    this[connections].length = 0
    this[state] = 'deleted'

    this[staticObject] = null
}

export function generatePrototype<T extends object>(obj: T): Prototype<T> {
    return {
        getStaticObject,
        addEventListener,
        remove,
        localeRemove,

        [id]: uuid(),
        [events]: {
            change: new Array(),
            remove: new Array(),
        },
        [connections]: new Array(),
        [staticObject]: obj,
        [shouldReSend]: false,
        [isGlobalObject]: obj !== EMPTY_OBJECT,
        [state]: obj === EMPTY_OBJECT ? 'created' : 'added',
    }
}
