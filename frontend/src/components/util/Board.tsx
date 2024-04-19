import { FC } from 'react';
import * as reactKonva from 'react-konva';

export type BoardProps = {
    width: number;
    height: number;
};

const BoardCanvas: FC<BoardProps> = (props) => {
    return (
        <reactKonva.Stage width={props.width} height={props.height} className='border'>
            <reactKonva.Layer>
                <reactKonva.Rect
                    x={20}
                    y={20}
                    width={100}
                    height={100}
                    fill="red"
                    shadowBlur={10}
                />
            </reactKonva.Layer>
        </reactKonva.Stage>
    );
};

export default BoardCanvas;
