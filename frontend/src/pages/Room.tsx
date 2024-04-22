import BoardCanvas from '@/components/util/Board';
import { ExtractRouteParams } from '@/lib/util/typeMagic';
import { useParams } from 'react-router-dom';
import { WSContext } from '@/lib/wsContext';
import { useCallback, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useKeycloak } from '@react-keycloak/web';
import { BoardContext, BoardOptions } from '@/lib/boardOptionsContext';
import ChatWindow from '@/components/util/ChatWindow';

type RoomRouteParams = ExtractRouteParams<'/app/:roomId'>;

const brushColors = ['black', 'white', 'red', 'blue', 'green'];
const brushSizes = [5, 7.5, 10, 12.5, 15];

const Room = () => {
    const params = useParams<keyof RoomRouteParams>();
    const { keycloak } = useKeycloak();
    const exportImage = useRef<() => void>();
    const ws = useRef(io('ws://localhost:3001/'));
    ws.current.emit('verify', keycloak.token);
    const [success, setSuccess] = useState(false);

    const [boardOptions, setBoardOptions] = useState<BoardOptions>({
        brushColor: 'black',
        brushSize: 5
    });

    const tryCopyInvite = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(params.roomId ?? '');
            setSuccess(true);
            setTimeout(setSuccess, 1000, false);
        } catch(err) {}     // eslint-disable-line
    }, [params.roomId]);

    return (
        <WSContext.Provider value={ws.current}>
            <BoardContext.Provider value={boardOptions}>
                <div className='d-flex flex-column h-100'>
                    <header className='p-3 bg-dark text-white'>
                        <div className='container-fluid'>
                            <div className='d-flex align-items-center justify-content-center justify-content-lg-start'>
                                <a href='/app/dashboard' className='d-flex align-items-center text-white'>
                                    <span>My Whamboard</span>
                                </a>
                            </div>
                        </div>
                    </header>

                    <main className='flex-grow-1'>
                        <div className='d-flex h-100'>
                            <div className='fixme d-flex flex-column gap-2 flex-grow-1 col-auto align-items-center justify-content-center'>
                                <BoardCanvas exportImage={exportImage} width={800} height={600} room={params.roomId} />

                                <div className='d-flex justify-content-center align-items-center gap-2' style={{ width: '800px' }}>
                                    {brushColors.map(color => (
                                        <button 
                                            key={color} 
                                            type='button' 
                                            className='btn btn-primary rounded-circle p-0' 
                                            style={{ backgroundColor: color, width: '2rem', height: '2rem' }}
                                            onClick={() => setBoardOptions(opts => {
                                                opts = structuredClone(opts);
                                                opts.brushColor = color;
                                                return opts;
                                            })}
                                        />
                                    ))}

                                    <div className='ms-auto' />
                                    {brushSizes.map(size => (
                                        <button 
                                            key={size}
                                            type='button' 
                                            className='btn rounded-circle p-0' 
                                            style={{ width: '2rem', height: '2rem' }}
                                            onClick={() => setBoardOptions(opts => {
                                                opts = structuredClone(opts);
                                                opts.brushSize = size;
                                                return opts;
                                            })}
                                        >
                                            <div className='w-100 h-100 rounded-circle' style={{ backgroundColor: '#000', transform: `scale(${size / 15})`}} />
                                        </button>    
                                    ))}
                                </div>
                            </div>

                            <ChatWindow />
                        </div>
                    </main>

                    <footer className='d-flex gap-2 p-1 bg-light'>
                        <button className='btn btn-primary' onClick={() => exportImage.current && exportImage.current()}>Export canvas</button>
                        <button className='btn btn-primary' onClick={tryCopyInvite}>Copy room invite</button>
                        <div className='btn bg-success text-white' style={{ opacity: success ? 1 : 0, transition: 'all 200ms' }}>Success</div>
                    </footer>
                </div>
            </BoardContext.Provider>
        </WSContext.Provider>
    );
};

export default Room;
