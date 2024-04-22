import { WSContext } from '@/lib/wsContext';
import { FC, useCallback, useContext, useEffect, useRef, useState } from 'react';

type Message = {
    content: string
    author: string
};

const sampleMessages = [
    { content: 'foo', author: 'bar' },
    { content: 'hello', author: 'world' }
];

const ChatWindow: FC = () => {
    const [messages, setMessages] = useState<Message[]>(sampleMessages);
    const messageRef = useRef<HTMLInputElement>(null);
    const msgContainerRef = useRef<HTMLDivElement>(null);
    const ws = useContext(WSContext);

    const pushMessage = useCallback((message: Message) => {
        setMessages(messages => {
            messages.push(message);
            return [...messages];
        });
        setTimeout(() => {
            if (msgContainerRef.current) {
                msgContainerRef.current.scrollTop = msgContainerRef.current.scrollHeight;
            }
        }, 10);
    }, []);

    const sendMessage = useCallback(() => {
        if (!messageRef.current) return;
        if (!ws) return;

        const content = messageRef.current.value;
        if (!content) return;

        messageRef.current.value = '';
        ws.emit('chatMessage', content);
    }, [ws, messageRef]);

    useEffect(() => {
        if (ws) {
            ws.on('chatMessage', (content: string, author: string) => {
                pushMessage({ content, author });
            });
        }

        return () => {
            if (ws) ws.removeAllListeners('chatMessage');
        };
    }, [pushMessage, ws]);

    return (
        <div className='d-flex flex-column border border-primary p-2 gap-2' style={{ width: '24rem', maxHeight: '89vh' }}>
            <h4 className='col-9 m-0 px-2 pt-2'>Chat</h4>
            <div className='bg-secondary w-100 my-2' style={{ height: '1px' }}></div>

            <div className='d-flex flex-column gap-2 overflow-auto' ref={msgContainerRef}>
                {messages.map((msg, i) => (
                    <div className='card p-2 d-flex flex-column' key={i}>
                        <b>{msg.author}</b>
                        <div>{msg.content}</div>
                    </div>
                ))}
            </div>

            <div className='d-flex gap-2 mt-auto'>
                <input className='flex-grow-1' ref={messageRef} onKeyDown={e => e.key === 'Enter' && sendMessage()} />
                <button className='btn btn-primary' onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
};

export default ChatWindow;
