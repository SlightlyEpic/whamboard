import { FC, useCallback, useEffect, useRef, useState } from 'react';
import * as reactKonva from 'react-konva';
import konva from 'konva';
import { useContext } from 'react';
import { WSContext } from '@/lib/wsContext';
import { useKeycloak } from '@react-keycloak/web';
import { BoardContext } from '@/lib/boardOptionsContext';

export type BoardProps = {
    width: number;
    height: number;
    room: string | undefined;
};

type Line = { points: number[], color: string, strokeWidth: number };
type BoardObject = {
    authorId: string
    data: Line
}

const BoardCanvas: FC<BoardProps> = (props) => {
    const { keycloak } = useKeycloak();
    const ws = useContext(WSContext);
    const mouseDown = useRef(false);
    const stageRef = useRef<HTMLDivElement>(null);
    const lastPoint = useRef<[number, number] | null>(null);
    const isHost = useRef(false);
    const boardOptions = useContext(BoardContext);

    const [lines, setLines] = useState<Line[]>([]);

    const addLine = useCallback((line: Line, emit: boolean) => {
        setLines(lines => {
            const newLines = [...lines];
            newLines.push(line);
            return newLines;
        });

        if(emit && ws) {
            const object: BoardObject = {
                authorId: ws.id!,
                data: line
            };
            ws.emit('newObject', object);
        }
    }, [ws]);
    
    const sendEvent = useCallback(() => {
        if (!ws) return;
        console.log('emitting');
        ws.emit('ping');
    }, [ws]);

    const line = useCallback((e: konva.KonvaEventObject<MouseEvent>) => {
        if(!ws || !stageRef.current || !mouseDown.current) return;

        const rect = stageRef.current.getBoundingClientRect();
        const x2 = e.evt.x - rect.x;
        const y2 = e.evt.y - rect.y;
        const x1 = lastPoint.current ? lastPoint.current[0] : x2;
        const y1 = lastPoint.current ? lastPoint.current[1] : y2;

        lastPoint.current = [x2, y2];

        addLine({
            points: [x1, y1, x2, y2],
            color: boardOptions.brushColor,
            strokeWidth: boardOptions.brushSize
        }, true);
    }, [ws, addLine, boardOptions]);

    const broadcastBoard = useCallback(() => {
        if(!ws) return;
        if(isHost.current) {
            console.log('broadcast requested');
            ws.emit('boardBroadcast', lines);
        }
    }, [ws, lines]);

    // Initialize dom listeners and ws listeners
    useEffect(() => {
        const setMouseDown = () => mouseDown.current = true;
        const unsetMouseDown = () => mouseDown.current = false;
        window.addEventListener('mousedown', setMouseDown);
        window.addEventListener('mouseup', () => {
            unsetMouseDown();
            lastPoint.current = null;
        });

        if(ws) {
            ws.once('verified', () => {
                console.log('Verified');

                ws.emit('joinRoom', props.room);
                ws.emit('requestBoardBroadcast');
            });

            ws.on('newObject', (object: BoardObject) => {
                if(object.authorId !== ws.id) addLine(object.data, false);
            });

            ws.on('enableHostMode', () => {
                isHost.current = true;
                console.log('enabled host mode');
            });


            ws.on('boardBroadcast', lines => {
                console.log('board broadcasted', lines);
                if(!isHost.current) setLines(lines);
            });

            ws.emit('verify', keycloak.token!);
        }

        return () => {
            window.removeEventListener('mousedown', setMouseDown);
            window.removeEventListener('mouseup', unsetMouseDown);

            if(ws) {
                ws.removeAllListeners('newObject');
                ws.removeAllListeners('enableHostMode');
                ws.removeAllListeners('boardBroadcast');
            }
        };
    }, [ws]);

    useEffect(() => {
        if(!ws) return;
        ws.on('requestBoardBroadcast', broadcastBoard);

        return () => {
            ws.removeAllListeners('requestBoardBroadcast');
        };
    }, [ws, broadcastBoard]);

    return (
        <div ref={stageRef}>
            <reactKonva.Stage 
                width={props.width} 
                height={props.height} 
                className='border' 
                onMouseMove={line} 
            >
                <reactKonva.Layer>
                    <reactKonva.Rect
                        x={20}
                        y={20}
                        width={100}
                        height={100}
                        fill="red"
                        shadowBlur={10}
                        onClick={sendEvent}
                    />
                    {lines.map((line, i) => (
                        <reactKonva.Line 
                            key={i} 
                            points={line.points} 
                            stroke={line.color} 
                            strokeWidth={line.strokeWidth}
                            lineJoin='round'
                            lineCap='round'
                        />
                    ))}
                    {/* `{currLine && (
                        <reactKonva.Line points={currLine.points} stroke={currLine.color} />
                    )}` */}
                </reactKonva.Layer>
            </reactKonva.Stage>
        </div>
    );
};

export default BoardCanvas;
