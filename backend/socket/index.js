const socketSetup = (io) => {
    let onlineUsers = new Map();
  
    io.on("connection", socket => {
      socket.on("user-connected", (userId) => {
        onlineUsers.set(userId, socket.id);
        io.emit("update-online-users", Array.from(onlineUsers.keys()));
      });
  
      socket.on("send-message", ({ chatId, message }) => {
        // Broadcast message to other participant
        // Assume you have their socket ID stored
      });
  
      socket.on("disconnect", () => {
        for (const [uid, sid] of onlineUsers.entries()) {
          if (sid === socket.id) {
            onlineUsers.delete(uid);
            break;
          }
        }
        io.emit("update-online-users", Array.from(onlineUsers.keys()));
      });
    });
  };
  
  module.exports = socketSetup;
  