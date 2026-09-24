import { createServer } from 'http'
import { Server } from 'socket.io'

// Chat mini-service — real-time relay + presence
// Port MUST be fixed (3003). Caddy forwards ?XTransformPort=3003 -> here.

const httpServer = createServer()
const io = new Server(httpServer, {
  path: '/',
  cors: { origin: '*', methods: ['GET', 'POST'] },
  pingTimeout: 60000,
  pingInterval: 25000,
})

type OnlineUser = {
  userId: string
  name: string
  avatarUrl: string
}

// userId -> Set<socketId>  (a user may have multiple tabs)
const userSockets = new Map<string, Set<string>>()
const socketToUser = new Map<string, OnlineUser>()

const emitOnlineList = () => {
  const list = Array.from(userSockets.keys())
  io.emit('online-users', { userIds: list })
}

io.on('connection', (socket) => {
  socket.on('join', (payload: OnlineUser) => {
    socketToUser.set(socket.id, payload)
    let set = userSockets.get(payload.userId)
    if (!set) {
      set = new Set()
      userSockets.set(payload.userId, set)
    }
    set.add(socket.id)
    socket.join(`user:${payload.userId}`)
    emitOnlineList()
    console.log(`[chat] ${payload.name} joined (${userSockets.size} online)`)
  })

  // Relay a private message to recipient + sender's other tabs.
  // Persistence is handled by the Next.js API route before this is emitted.
  socket.on('private-message', (data: { toUserId: string; message: any }) => {
    const sender = socketToUser.get(socket.id)
    if (!sender) return
    const envelope = { from: sender.userId, message: data.message }
    // to recipient
    socket.to(`user:${data.toUserId}`).emit('private-message', envelope)
    // to sender's other tabs (not back to this socket)
    socket.to(`user:${sender.userId}`).emit('private-message', envelope)
  })

  socket.on('typing', (data: { toUserId: string; isTyping: boolean }) => {
    const sender = socketToUser.get(socket.id)
    if (!sender) return
    socket.to(`user:${data.toUserId}`).emit('typing', { from: sender.userId, isTyping: data.isTyping })
  })

  socket.on('read-receipt', (data: { toUserId: string; messageIds: string[] }) => {
    const sender = socketToUser.get(socket.id)
    if (!sender) return
    socket.to(`user:${data.toUserId}`).emit('read-receipt', { from: sender.userId, messageIds: data.messageIds })
  })

  socket.on('disconnect', () => {
    const user = socketToUser.get(socket.id)
    if (user) {
      const set = userSockets.get(user.userId)
      if (set) {
        set.delete(socket.id)
        if (set.size === 0) {
          userSockets.delete(user.userId)
        }
      }
      socketToUser.delete(socket.id)
      emitOnlineList()
      console.log(`[chat] ${user.name} left (${userSockets.size} online)`)
    }
  })
})

const PORT = 3003
httpServer.listen(PORT, () => {
  console.log(`Chat service running on port ${PORT}`)
})

process.on('SIGTERM', () => httpServer.close(() => process.exit(0)))
process.on('SIGINT', () => httpServer.close(() => process.exit(0)))
