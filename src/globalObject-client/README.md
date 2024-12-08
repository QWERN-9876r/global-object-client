# global-object-client

## Try this

### client

```typescript
import { GlobalObject } from 'global-object-client'

GlobalObject.get<{ hello: string }>('http://0.0.0.0:3003').then((gObj) => {
    console.log(gObj.hello)
})
```

### server

```typescript
import { GlobalObject } from 'global-object-server'

import express from 'express'
import { createServer } from 'node:http'

const app = express()

// Configuring the cors
app.use(function (_, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'X-Requested-With')
    res.header('Access-Control-Allow-Headers', 'Content-Type')
    res.header(
        'Access-Control-Allow-Methods',
        'PUT, GET, POST, DELETE, OPTIONS'
    )
    next()
})

const server = createServer(app)

// It is necessary only if you need to customize server
// operation from outside the library or if you want to use any frameworks
GlobalObject.config.server = server

const gObj = GlobalObject.create({ hello: 'world' })

GlobalObject.send(gObj, 3003)
```
