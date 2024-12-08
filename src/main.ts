import { GlobalObject } from './globalObject-client'

interface Message {
    author: string
    text: string
    time: number
}

const userName = localStorage.getItem('userName') || Math.random().toString()

localStorage.setItem('userName', userName)

const messages = document.querySelector('.messages') as HTMLDivElement
const inputMessage = document.querySelector('.inputMessage') as HTMLInputElement
const sendBtn = document.querySelector('.sendBtn') as HTMLButtonElement

GlobalObject.get<Message[]>('http://0.0.0.0:3003').then((gObj) => {
    function render() {
        if (!Array.isArray(gObj)) return
        if (GlobalObject.getState(gObj) !== 'added') return

        messages.innerHTML = ''

        gObj.forEach(({ text, time, author }) => {
            const messageDiv = document.createElement('div')
            const messageDivInner = document.createElement('div')
            const timeSpan = document.createElement('span')
            const textSpan = document.createElement('span')
            messageDiv.classList.add('message')
            if (author === userName) messageDiv.classList.add('myMessage')

            textSpan.classList.add('text')
            textSpan.textContent = text

            timeSpan.classList.add('time')
            const date = new Date(time)
            timeSpan.textContent =
                date.getHours() +
                ':' +
                (date.getMinutes() < 10 ? '0' : '') +
                date.getMinutes()

            messageDivInner.appendChild(textSpan)
            messageDivInner.appendChild(timeSpan)
            messageDiv.appendChild(messageDivInner)
            messages.appendChild(messageDiv)
        })
    }

    function sendMassage() {
        if (!Array.isArray(gObj) || !inputMessage.value.trim()) return

        const message: Message = {
            author: userName,
            text: inputMessage.value,
            time: Date.now(),
        }

        gObj.push(message)
        inputMessage.value = ''
    }

    render()

    gObj.addEventListener('change', render)
    gObj.addEventListener('remove', render)

    sendBtn.addEventListener('click', sendMassage)
    document.addEventListener(
        'keypress',
        ({ key }) => key === 'Enter' && sendMassage()
    )
})
