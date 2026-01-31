import { WebSocket } from 'ws';
import { pool } from '../config/db';

interface RoomClient {
    ws: WebSocket;
    userId: number;
    roomId: number;
}

// Map Room ID -> Set of Clients
const roomClients = new Map<number, Set<RoomClient>>();

// Helper: Broadcast message to all clients in a room
export function broadcastToRoom(roomId: number, message: any) {
    const clients = roomClients.get(roomId);
    if (clients) {
        const data = JSON.stringify(message);
        clients.forEach(client => {
            if (client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(data);
            }
        });
    }
}

// Helper: Notify room of leaderboard update
export async function notifyLeaderboardUpdate(roomId: number) {
    try {
        const participantsRes = await pool.query(`
            SELECT 
                rp.user_id, u.username, u.avatar_url, 
                rp.score, rp.time_taken, rp.joined_at
            FROM room_participants rp
            JOIN users u ON rp.user_id = u.id
            WHERE rp.room_id = $1
            ORDER BY rp.score DESC, rp.time_taken ASC
        `, [roomId]);

        const participants = participantsRes.rows;

        broadcastToRoom(roomId, {
            type: 'LEADERBOARD_UPDATE',
            leaderboard: participants
        });
    } catch (error) {
        console.error('Error broadcasting leaderboard:', error);
    }
}

// Helper: Add client to room
export function joinRoomSocket(ws: WebSocket, userId: number, roomId: number) {
    if (!roomClients.has(roomId)) {
        roomClients.set(roomId, new Set());
    }

    const client: RoomClient = { ws, userId, roomId };
    roomClients.get(roomId)?.add(client);

    console.log(`User ${userId} joined socket room ${roomId}`);

    // Remove client on disconnect
    ws.on('close', () => {
        const roomSet = roomClients.get(roomId);
        if (roomSet) {
            roomSet.delete(client);
            if (roomSet.size === 0) {
                roomClients.delete(roomId);
            }
        }
        console.log(`User ${userId} disconnected from socket room ${roomId}`);
    });
}
