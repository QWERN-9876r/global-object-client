import { events } from '../symbols'
import { Events, TGlobalObject } from '../types'

export function makeEvent<T extends object>(
    gObj: TGlobalObject<TGlobalObject<T>>,
    eventName: keyof Events,
    ...params: any[]
) {
    gObj[events][eventName].forEach((listener) => listener(...params))
}
