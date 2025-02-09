require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { initializeApp } = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");
const admin = require("firebase-admin");

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"), // Handle newlines in the private key
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: process.env.UNIVERSE_DOMAIN,
};

initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL,
});

const db = getDatabase();
const app = express();
const server = http.createServer(app);
const allowedOrigins = ["https://cipherthread.onrender.com"];
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
  transports: ["websocket"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

const users = {}; // Mapping of userId -> socketId

// Socket.io connection setup
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Register a new user
  socket.on("register", ({ userId }) => {
    users[userId] = socket.id;
    console.log(`User registered: ${userId} -> ${socket.id}`);
  });

  // Send a message
  socket.on("sendMessage", async (data) => {
    const { senderId, recipientId, encryptedMessage, messageType, sentTime } =
      data;

    const chatKey =
      senderId < recipientId
        ? `${senderId}-${recipientId}`
        : `${recipientId}-${senderId}`;

    const newMessageRef = db.ref(`chats/${chatKey}`).push();

    await newMessageRef.set({
      senderId,
      recipientId,
      encryptedMessage,
      messageType,
      sentTime, // Store the provided sentTime
      seen: false, // Mark message as unseen initially
    });

    if (users[recipientId]) {
      // If recipient is online, send the message in real-time
      io.to(users[recipientId]).emit("receiveMessage", {
        senderId,
        encryptedMessage,
        messageType,
        sentTime, // Use the sentTime from the message
      });

      // Mark message as seen if recipient is online
      await newMessageRef.update({ seen: true });
    }
  });

  // Load unseen messages
  socket.on("loadUnseenMessages", async ({ userId }) => {
    const messagesRef = db.ref("chats");
    const snapshot = await messagesRef.once("value");
    const allChats = snapshot.val();

    const unseenMessages = {};
    for (const chatKey in allChats) {
      const messages = allChats[chatKey];
      for (const msgId in messages) {
        const message = messages[msgId];
        if (message.recipientId === userId && !message.seen) {
          if (!unseenMessages[chatKey]) {
            unseenMessages[chatKey] = [];
          }
          unseenMessages[chatKey].push({
            ...message,
            msgId,
          });
        }
      }
    }

    // Emit unseen messages grouped by chatKey
    socket.emit("loadUnseenMessages", unseenMessages);
  });

  // Mark messages as seen
  socket.on("markMessagesAsSeen", async ({ userId, chatKey }) => {
    const chatRef = db.ref(`chats/${chatKey}`);
    const snapshot = await chatRef.once("value");
    const messages = snapshot.val();

    if (messages) {
      const updates = {};
      Object.keys(messages).forEach((msgId) => {
        const message = messages[msgId];
        if (message.recipientId === userId && !message.seen) {
          updates[`chats/${chatKey}/${msgId}/seen`] = true;
        }
      });

      await db.ref().update(updates);
    }
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    const userId = Object.keys(users).find((key) => users[key] === socket.id);
    if (userId) {
      delete users[userId];
    }
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start the server
const PORT = process.env.PORT || 5000; // Use Render's dynamic port or fallback to 5000 for local dev
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
