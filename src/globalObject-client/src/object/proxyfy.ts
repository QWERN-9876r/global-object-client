import type { GlobalObject as GlobalObjectType } from '../GlobalObject'
import type { TGlobalObject } from '../types'
import {
    events,
    id,
    requestQueue,
    sendAllRequestsWithQueue,
    shouldReSend,
    staticObject,
} from '../symbols'

export function proxyfy<T extends object>(
    obj: T | null,
    GlobalObject: typeof GlobalObjectType
) {
    return (
        obj === null
            ? {}
            : new Proxy(obj, {
                  set(
                      target: TGlobalObject<T>,
                      propertyKey: PropertyKey,
                      value: T[keyof T],
                      receiver?: any
                  ) {
                      if (typeof propertyKey === 'symbol')
                          return Reflect.set(
                              target,
                              propertyKey,
                              value,
                              receiver
                          )

                      if (target[shouldReSend]) {
                          !GlobalObject[requestQueue].length &&
                              queueMicrotask(
                                  GlobalObject[sendAllRequestsWithQueue]
                              )

                          GlobalObject[requestQueue].push({
                              target,
                              eventName: 'update',
                              data: {
                                  id: target[id],
                                  key: propertyKey,
                                  value,
                              },
                          })
                      }

                      if (!target[staticObject]) {
                          target[staticObject] = {} as T
                      }

                      const res =
                          Reflect.set(
                              target[staticObject] as T,
                              propertyKey,
                              value,
                              receiver
                          ) && Reflect.set(target, propertyKey, value, receiver)

                      target[events]?.change.forEach((listener) => {
                          listener(target, propertyKey, value)
                      })

                      return res
                  },
              })
    ) as TGlobalObject<T | {}>
}
