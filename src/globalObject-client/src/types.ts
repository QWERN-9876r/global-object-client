import type { Socket } from 'socket.io-client'
import type {
    connections,
    events,
    id,
    isGlobalObject,
    shouldReSend,
    state,
    staticObject,
} from './symbols'

export type ChangeEventListener<T extends object> = (
    obj: TGlobalObject<T>,
    key: PropertyKey,
    value: T[keyof T]
) => void

export type RemoveEventListener = () => void

export type Events = Record<'change' | 'remove', Function[]>

export interface RequestData {
    target: TGlobalObject<Record<any, any>>
    eventName: string
    data: { id: string } & Record<string, any>
}

export type State = 'created' | 'added' | 'deleted'

export type TGlobalObject<T extends object> = T & Prototype<T>

export interface Prototype<T extends object> {
    [connections]: Socket[]
    [staticObject]: T | null
    [id]: string
    [events]: Events
    [shouldReSend]: boolean
    [isGlobalObject]: boolean
    [state]: State
    getStaticObject: () => T | null
    addEventListener: (
        eventName: keyof Events,
        listener: Events[typeof eventName][0]
    ) => void
    remove: () => void
    localeRemove: () => void
}
