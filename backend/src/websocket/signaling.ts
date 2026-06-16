import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import db from '../database';

interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'call-request' | 'call-accept' | 'call-reject' | 'call-end' | 'ping';
  callId?: string;
  targetUserId?: string;
  sdp?: string;
  candidate?: any;
  translationEnabled?: boolean;
}

interface ConnectedClient {
  ws: WebSocket;
  userId: string;
  username: string;
}

const clients = new Map<string, ConnectedClient>();

export function setupWebSocketSignaling(wss: WebSocketServer): void {
  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    let clientInfo: { userId: string; username: string } | null = null;
    let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

    console.log('🔌 New WebSocket connection');

    // Send initial connection success
    sendMessage(ws, { type: 'connected', message: 'WebSocket connected' });

    ws.on('message', (data: Buffer) => {
      try {
        const message: SignalingMessage = JSON.parse(data.toString());

        // Handle ping (keep-alive)
        if (message.type === 'ping') {
          sendMessage(ws, { type: 'pong' });
          return;
        }

        // Handle authentication
        if ((message as any).type === 'auth' || (message as any).token) {
          const token = (message as any).token;
          if (!token) {
            sendMessage(ws, { type: 'error', message: 'Authentication token required' });
            return;
          }

          try {
            const decoded = verifyAccessToken(token);
            clientInfo = { userId: decoded.userId, username: decoded.username };

            // Store client connection
            clients.set(decoded.userId, { ws, userId: decoded.userId, username: decoded.username });

            // Update user online status
            db.prepare('UPDATE users SET is_online = 1, last_seen = ? WHERE id = ?')
              .run(new Date().toISOString(), decoded.userId);

            console.log(`✅ User authenticated via WebSocket: ${decoded.username} (${decoded.userId})`);

            sendMessage(ws, {
              type: 'authenticated',
              userId: decoded.userId,
              username: decoded.username,
            });

            // Start heartbeat
            heartbeatInterval = setInterval(() => {
              if (ws.readyState === WebSocket.OPEN) {
                sendMessage(ws, { type: 'ping' });
              }
            }, 30000);

            return;
          } catch (error) {
            sendMessage(ws, { type: 'error', message: 'Invalid token' });
            return;
          }
        }

        // All following messages require authentication
        if (!clientInfo) {
          sendMessage(ws, { type: 'error', message: 'Not authenticated. Send auth token first.' });
          return;
        }

        // Handle signaling messages
        switch (message.type) {
          case 'offer':
          case 'answer':
          case 'ice-candidate': {
            if (!message.targetUserId || !message.callId) {
              sendMessage(ws, { type: 'error', message: 'targetUserId and callId required' });
              return;
            }

            const targetClient = clients.get(message.targetUserId);
            if (!targetClient || targetClient.ws.readyState !== WebSocket.OPEN) {
              sendMessage(ws, { type: 'error', message: 'Target user is not connected' });
              return;
            }

            // Forward signaling message to target
            sendMessage(targetClient.ws, {
              type: message.type,
              callId: message.callId,
              sdp: message.sdp,
              candidate: message.candidate,
              fromUserId: clientInfo.userId,
              fromUsername: clientInfo.username,
            });
            break;
          }

          case 'call-request': {
            if (!message.targetUserId) {
              sendMessage(ws, { type: 'error', message: 'targetUserId required for call request' });
              return;
            }

            const targetClient = clients.get(message.targetUserId);
            if (!targetClient || targetClient.ws.readyState !== WebSocket.OPEN) {
              sendMessage(ws, { type: 'error', message: 'Target user is offline' });
              return;
            }

            // Forward call request to target
            sendMessage(targetClient.ws, {
              type: 'call-request',
              callId: message.callId,
              fromUserId: clientInfo.userId,
              fromUsername: clientInfo.username,
              translationEnabled: message.translationEnabled,
            });

            // Tell caller the request was sent
            sendMessage(ws, {
              type: 'call-requested',
              callId: message.callId,
              targetUserId: message.targetUserId,
            });
            break;
          }

          case 'call-accept': {
            if (!message.targetUserId || !message.callId) {
              sendMessage(ws, { type: 'error', message: 'targetUserId and callId required' });
              return;
            }

            const targetClient = clients.get(message.targetUserId);
            if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
              sendMessage(targetClient.ws, {
                type: 'call-accepted',
                callId: message.callId,
                fromUserId: clientInfo.userId,
                fromUsername: clientInfo.username,
              });
            }
            break;
          }

          case 'call-reject': {
            if (!message.targetUserId || !message.callId) {
              sendMessage(ws, { type: 'error', message: 'targetUserId and callId required' });
              return;
            }

            const targetClient = clients.get(message.targetUserId);
            if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
              sendMessage(targetClient.ws, {
                type: 'call-rejected',
                callId: message.callId,
                fromUserId: clientInfo.userId,
                fromUsername: clientInfo.username,
              });
            }
            break;
          }

          case 'call-end': {
            if (!message.targetUserId || !message.callId) {
              sendMessage(ws, { type: 'error', message: 'targetUserId and callId required' });
              return;
            }

            const targetClient = clients.get(message.targetUserId);
            if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
              sendMessage(targetClient.ws, {
                type: 'call-ended',
                callId: message.callId,
                fromUserId: clientInfo.userId,
              });
            }
            break;
          }

          default:
            sendMessage(ws, { type: 'error', message: `Unknown message type: ${message.type}` });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        sendMessage(ws, { type: 'error', message: 'Invalid message format' });
      }
    });

    ws.on('close', () => {
      if (clientInfo) {
        console.log(`🔌 WebSocket disconnected: ${clientInfo.username}`);
        clients.delete(clientInfo.userId);

        // Set user offline
        db.prepare('UPDATE users SET is_online = 0, last_seen = ? WHERE id = ?')
          .run(new Date().toISOString(), clientInfo.userId);
      }

      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      if (clientInfo) {
        clients.delete(clientInfo.userId);
      }
    });
  });
}

function sendMessage(ws: WebSocket, message: object): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

/**
 * Send notification to a specific user via WebSocket
 */
export function notifyUser(userId: string, notification: object): boolean {
  const client = clients.get(userId);
  if (client && client.ws.readyState === WebSocket.OPEN) {
    sendMessage(client.ws, {
      type: 'notification',
      ...notification,
    });
    return true;
  }
  return false;
}

/**
 * Get count of currently connected users
 */
export function getConnectedUsersCount(): number {
  return clients.size;
}

/**
 * Check if a user is currently connected via WebSocket
 */
export function isUserConnected(userId: string): boolean {
  const client = clients.get(userId);
  return !!client && client.ws.readyState === WebSocket.OPEN;
}