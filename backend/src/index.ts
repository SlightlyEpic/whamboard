import 'dotenv/config';
import express from 'express';
import { Server } from 'socket.io';
import http from 'http';

import { verifyToken } from './lib/verifyToken';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

// roomId -> hostId
const roomHosts: Record<string, string> = {};
// hostId -> roomId
const hostsRoom: Record<string, string> = {};

io.on('connection', socket => {
    let id: string;
    let roomId: string;
    let name: string;
    let isHost = false;
    // console.log('New connection');

    socket.on('ping', () => {
        // console.log('Ping from', name); 
    })

    socket.once('verify', async (token: string) => {
        try {
            const { sid, name: name_ } = await verifyToken(token);
            id = socket.id;
            name = name_;
            // console.log('Verified', id, name);

            // Attach listeners after identity is verified
            socket.on('joinRoom', (newRoomId: string) => {
                // console.log(`${name} joining ${newRoomId}`);
                socket.rooms.forEach(room => socket.leave(room));
                socket.join(newRoomId);
                roomId = newRoomId;
                isHost = false;

                let roomCount = io.sockets.adapter.rooms.get(newRoomId)!.size;
                // console.log('roomCount:', roomCount);
                if(roomCount === 1) {
                    socket.emit('enableHostMode');
                    isHost = true;

                    delete roomHosts[hostsRoom[id!]];
                    roomHosts[newRoomId] = id!;
                    hostsRoom[id!] = newRoomId;
                }

                socket.to(roomId).emit('newUser', name, socket.id);
            });

            socket.on('newObject', object => {
                if(!roomId) return;
                socket.to(roomId).emit('newObject', object);
            });

            socket.on('chatMessage', (msg: string) => {
                if(!roomId) return;
                socket.to(roomId).emit('chatMessage', msg, name, socket.id);
            });

            socket.on('requestBoardBroadcast', () => {
                socket.to(roomId).emit('requestBoardBroadcast');
            });

            socket.on('boardBroadcast', board => {
                socket.to(roomId).emit('boardBroadcast', board);
            });

            socket.on('cursorUpdate', (x, y, name) => {
                socket.to(roomId).emit('cursorUpdate', x, y, name);
            });

            // Emit verification confirmation
            socket.emit('verified');
        } catch(err) {
            // console.log('Rejected:', socket.id, err);
            socket.disconnect();
        }
    });
});

server.listen(3001, () => {
    console.log('Server listening on port 3001');
});
