import { FC, useCallback, useEffect, useRef, useState, Fragment } from 'react';
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
    exportImage: React.MutableRefObject<(() => void) | undefined>
};

type Line = { points: number[], color: string, strokeWidth: number };
type BoardObject = {
    authorId: string
    data: Line
}

const cursorColors = [
    '#ff0000', '#ff7f00', '#ffff00',
    '#7fff00', '#00ff00', '#00ff7f',
    '#00ffff', '#007fff', '#0000ff',
    '#7f00ff', '#ff00ff', '#ff007f',
    '#ff6666', '#ffcc66', '#ffff66'
];

const BoardCanvas: FC<BoardProps> = (props) => {
    const { keycloak } = useKeycloak();
    const ws = useContext(WSContext);
    const mouseDown = useRef(false);
    const stageRef = useRef<HTMLDivElement>(null);
    const drawingLayerRef = useRef(null);
    const lastPoint = useRef<[number, number] | null>(null);
    const isHost = useRef(false);
    const boardOptions = useContext(BoardContext);
    const [cursorOnCanvas, setCursorOnCanvas] = useState(false);
    const [cursors, setCursors] = useState<{ [name: string]: [x: number, y: number] }>({});

    props.exportImage.current = useCallback(() => {
        if(!drawingLayerRef.current) return;

        // eslint-disable-next-line
        const dataURL = (drawingLayerRef.current as any).toDataURL() as string;
        const link = document.createElement('a');
        link.download = 'canvas.png';
        link.href = dataURL;
        // document.appendChild(link);
        link.click();
        // document.removeChild(link);
    }, []);

    const [lines, setLines] = useState<Line[]>([]);

    const addLine = useCallback((line: Line, emit: boolean) => {
        setLines(lines => {
            const newLines = [...lines];
            newLines.push(line);
            return newLines;
        });

        if (emit && ws) {
            const object: BoardObject = {
                authorId: ws.id!,
                data: line
            };
            ws.emit('newObject', object);
        }
    }, [ws]);

    const updateCursors = useCallback((newX: number, newY: number, name: string) => {
        setCursors(cursors => {
            cursors[name] = [newX, newY];
            return { ...cursors };
        });
    }, []);

    const line = useCallback((e: konva.KonvaEventObject<MouseEvent>) => {
        if (!ws || !stageRef.current || !mouseDown.current) return;

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
        if (!ws) return;
        if (isHost.current) {
            console.log('broadcast requested');
            ws.emit('boardBroadcast', lines);
        }
    }, [ws, lines]);

    // Mouse event handlers
    const mouseEnter = useCallback(() => {
        if (!cursorOnCanvas) setCursorOnCanvas(true);
    }, [cursorOnCanvas]);

    const mouseLeave = useCallback(() => {
        if (cursorOnCanvas) {
            setCursorOnCanvas(false);
            if (ws) ws.emit('cursorUpdate', -1, -1, keycloak.tokenParsed!.name);
        }
    }, [cursorOnCanvas, ws, keycloak]);

    const mouseMove = useCallback((e: konva.KonvaEventObject<MouseEvent>) => {
        line(e);
        if (cursorOnCanvas && ws && stageRef.current) {
            const rect = stageRef.current.getBoundingClientRect();
            ws.emit('cursorUpdate', e.evt.x - rect.x, e.evt.y - rect.y, keycloak.tokenParsed!.name);
        }
    }, [cursorOnCanvas, ws, line, keycloak]);

    // Initialize dom listeners and ws listeners
    useEffect(() => {
        const setMouseDown = () => mouseDown.current = true;
        const unsetMouseDown = () => mouseDown.current = false;
        window.addEventListener('mousedown', setMouseDown);
        window.addEventListener('mouseup', () => {
            unsetMouseDown();
            lastPoint.current = null;
        });

        if (ws) {
            ws.once('verified', () => {
                console.log('Verified');

                ws.emit('joinRoom', props.room);
                ws.emit('requestBoardBroadcast');
            });

            ws.on('newObject', (object: BoardObject) => {
                if (object.authorId !== ws.id) addLine(object.data, false);
            });

            ws.on('enableHostMode', () => {
                isHost.current = true;
                console.log('enabled host mode');
            });


            ws.on('boardBroadcast', lines => {
                console.log('board broadcasted', lines);
                if (!isHost.current) setLines(lines);
            });

            ws.on('cursorUpdate', updateCursors);

            ws.emit('verify', keycloak.token!);
        }

        return () => {
            window.removeEventListener('mousedown', setMouseDown);
            window.removeEventListener('mouseup', unsetMouseDown);

            if (ws) {
                ws.removeAllListeners('newObject');
                ws.removeAllListeners('enableHostMode');
                ws.removeAllListeners('boardBroadcast');
            }
        };
    }, [ws]);

    useEffect(() => {
        if (!ws) return;
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
                onMouseMove={mouseMove}
                onMouseEnter={mouseEnter}
                onMouseLeave={mouseLeave}
            >
                <reactKonva.Layer ref={drawingLayerRef}>
                    <reactKonva.Rect
                        fill='white'
                        height={props.height}
                        width={props.width}
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
                </reactKonva.Layer>
                <reactKonva.Layer>
                    {Object.keys(cursors).map((name, i) => (
                        cursors[name][0] !== -1 && name !== keycloak.tokenParsed!.name && <Fragment key={i}>
                            <reactKonva.Circle
                                x={cursors[name][0]}
                                y={cursors[name][1]}
                                radius={2}
                                fill={cursorColors[name.length % cursorColors.length]}
                            />
                            <reactKonva.Rect 
                                x={cursors[name][0] + 6}
                                y={cursors[name][1] - 12}
                                fill={cursorColors[name.length % cursorColors.length]}
                                width={name.length * 10}
                                height={19}
                                cornerRadius={4}
                            />
                            <reactKonva.Text
                                x={cursors[name][0] + 10}
                                y={cursors[name][1] - 10}
                                fill='black'
                                text={name}
                                fontFamily='monospace'
                                fontSize={16}
                            />
                        </Fragment>
                    ))}
                </reactKonva.Layer>
            </reactKonva.Stage>
        </div>
    );
};

export default BoardCanvas;
