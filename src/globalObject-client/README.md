# global-object-client

## Try this

### client

index.html

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <link rel="stylesheet" href="./src/style.css" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Global objects</title>
    </head>
    <body>
        <div class="container">
            <span class="timer"></span>
            <button class="incrementBtn">increment</button>
        </div>
        <script type="module" src="/src/main.ts"></script>
    </body>
</html>
```

src/main.ts

```typescript
import { GlobalObject } from 'global-object-client'

GlobalObject.get<{ timer: number }>('http://0.0.0.0:3003').then((gObj) => {
    if (!GlobalObject.isGlobalObject(gObj) || !('timer' in gObj)) return

    const timerSpan = document.querySelector('.timer') as HTMLSpanElement
    const incrementBtn = document.querySelector(
        '.incrementBtn'
    ) as HTMLButtonElement

    incrementBtn.addEventListener('click', () => gObj.timer++)

    gObj.addEventListener(
        'change',
        () => (timerSpan.textContent = gObj.timer + '')
    )
    gObj.addEventListener('remove', () => (timerSpan.textContent = 'finished'))
})
```

### server

main.ts

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

const gObj = GlobalObject.create({ timer: 0 })

setInterval(() => {
    if (!('timer' in gObj)) return
    gObj.timer++

    if (gObj.timer >= 15) gObj.remove()
}, 1000)

GlobalObject.send(gObj, 3003)
```
