import { createContext } from 'react';

export type BoardOptions = {
    brushColor: string
    brushSize: number
};

export const BoardContext = createContext<BoardOptions>({
    brushColor: 'black',
    brushSize: 5
});
