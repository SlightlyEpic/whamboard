import { FC, useCallback, useEffect, useRef, useState } from 'react';
import * as reactKonva from 'react-konva';
import konva from 'konva';
import { useContext } from 'react';
import { WSContext } from '@/lib/wsContext';

export type BoardProps = {
    width: number;
    height: number;
};

const BoardCanvas: FC<BoardProps> = (props) => {
    const ws = useContext(WSContext);
    const mouseDown = useRef(false);
    const stageRef = useRef<HTMLDivElement>(null);

    type Line = { points: number[], color: string };
    const [lines, setLines] = useState<Line[]>([]);
    const [currLine, setCurrLine] = useState<Line>();
    
    const sendEvent = useCallback(() => {
        if (!ws) return;
        console.log('emitting');
        ws.emit('ping');
    }, [ws]);

    const startLine = useCallback((e: konva.KonvaEventObject<MouseEvent>) => {
        // console.log('start line');
        if(!stageRef.current) return;

        const rect = stageRef.current.getBoundingClientRect();
        const x = e.evt.x - rect.x;
        const y = e.evt.y - rect.y;
        setCurrLine({
            points: [x, y, x, y],
            color: 'black'
        });
    }, []);

    const line = useCallback((e: konva.KonvaEventObject<MouseEvent>) => {
        if (!ws) return;
        if (!mouseDown.current) return;
        if (!stageRef.current) return;
        // console.log('line');

        const rect = stageRef.current.getBoundingClientRect();
        const x = e.evt.x - rect.x;
        const y = e.evt.y - rect.y;
        setCurrLine(currLine => {
            if(!currLine) currLine = {
                points: [x, y],
                color: 'black'
            };
            const newCurrLine = structuredClone(currLine);
            newCurrLine.points.push(x);
            newCurrLine.points.push(y);

            return newCurrLine;
        });
    }, [ws]);

    const endLine = useCallback(() => {
        // console.log('ending line', currLine);
        if(!currLine) return;
        setLines(lines => {
            const newLines = [...lines];
            newLines.push(currLine);
            // console.log('newLines:', newLines);
            return newLines;
        });
        setCurrLine(undefined);
    }, [currLine]);

    useEffect(() => {
        const setMouseDown = () => mouseDown.current = true;
        const unsetMouseDown = () => mouseDown.current = false;
        window.addEventListener('mousedown', setMouseDown);
        window.addEventListener('mouseup', unsetMouseDown);

        return () => {
            window.removeEventListener('mousedown', setMouseDown);
            window.removeEventListener('mouseup', unsetMouseDown);
        };
    }, []);

    return (
        <div ref={stageRef}>
            <reactKonva.Stage 
                width={props.width} 
                height={props.height} 
                className='border' 
                onMouseDown={startLine} 
                onMouseMove={line} 
                onMouseUp={endLine}
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
                    {lines.map((line, i) => <reactKonva.Line key={i} points={line.points} stroke={line.color} />)}
                    {currLine && (
                        <reactKonva.Line points={currLine.points} stroke={currLine.color} />
                    )}
                </reactKonva.Layer>
            </reactKonva.Stage>
        </div>
    );
};

export default BoardCanvas;
