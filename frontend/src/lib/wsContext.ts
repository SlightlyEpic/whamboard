import { createContext } from 'react';
import io from 'socket.io-client';

export const WSContext = createContext<ReturnType<typeof io> | null>(null);
