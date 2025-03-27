import React, { useState, useRef, useEffect } from "react";
import { IoIosSend } from "react-icons/io";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import axios from "axios";

const Chat = ({ socket }) => {
  const { selectedUser } = useSelector((state) => state.selectedUser);
  const { user } = useSelector((state) => state.auth);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // New loading state
  const messagesEndRef = useRef(null);

  const getMessages = async () => {
    if (!user?._id || !selectedUser?._id) return; // Guard against missing IDs

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token");

      const messageData = {
        userId: user._id,
        receiverId: selectedUser._id,
      };
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/messages/get-message`,
        messageData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response?.data?.success) {
        setMessages(response.data.data.message || []);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
      toast.error("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch messages when user and selectedUser are available
  useEffect(() => {
    if (user && selectedUser && socket) {
      getMessages();
    }
  }, [user, selectedUser, socket]);

  // Socket setup for messages and online status
  useEffect(() => {
    if (socket && user) {
      // Ensure socket is connected before proceeding
      socket.on("connect", () => {
        console.log("Socket connected:", socket.id);
        socket.emit("AddUserSocket", user._id);
      });

      // Clean up previous listeners
      socket.off("receiveMessage");
      socket.off("getUsers");

      // Handle incoming messages
      socket.on("receiveMessage", (newMessage) => {
        if (newMessage.userId === selectedUser?._id) {
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        } else {
          console.log("Message not for the selected user, ignoring...");
        }
      });

      // Handle online users update
      socket.on("getUsers", (users) => {
        setOnlineUsers(users?.map((user) => user.userId) || []);
      });

      // Handle socket errors
      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        toast.error("Failed to connect to chat server");
      });

      // Cleanup on unmount
      return () => {
        socket.off("connect");
        socket.off("receiveMessage");
        socket.off("getUsers");
        socket.off("connect_error");
      };
    }
  }, [socket, selectedUser, user]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    try {
      const messageData = {
        userId: user?._id,
        receiverId: selectedUser?._id,
        message: messageText.trim(),
      };

      socket.emit("sendMessage", { messageData });

      const updateMessage = {
        userId: user?._id,
        message: messageText.trim(),
        time: Date.now(),
      };

      setMessages((prevMessages) => [...prevMessages, updateMessage]);

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/messages/send/`,
        messageData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            withCredentials: true,
          },
        }
      );

      if (response?.data?.success) {
        setMessageText("");
        getMessages();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    }
    return date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      day: "numeric",
      month: "short",
    });
  };

  // Check if selected user is online
  const isUserOnline = () => {
    return selectedUser && onlineUsers.includes(selectedUser._id)
      ? "Online"
      : "Offline";
  };

  // Fallback UI when no user is selected
  if (!selectedUser) {
    return (
      <div className="flex flex-col h-full bg-gray-50 items-center justify-center">
        <p className="text-gray-500">Select a user to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Chat header */}
      <header className="sticky top-0 z-10 bg-white shadow-sm py-3 px-4 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <img
            src={selectedUser?.profile || "https://via.placeholder.com/40"}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500"
          />
          <div>
            <h3 className="font-medium text-gray-900">
              {selectedUser?.name || "Unknown User"}
            </h3>
            <p className="text-xs text-gray-500">{isUserOnline()}</p>
          </div>
        </div>
      </header>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[url('https://web.whatsapp.com/img/bg-chat-tile-light_a4be512e7195b6b733d9110b408f075d.png')] bg-repeat bg-opacity-5">
        {isLoading ? (
          <p className="text-center text-gray-500">Loading messages...</p>
        ) : messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message._id || message.time} // Use time as fallback for locally added messages
              className={`flex ${
                message.userId === user?._id ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                  message.userId === user?._id
                    ? "bg-green-200 text-slate-700 rounded-tr-none"
                    : "bg-rose-100 text-slate-800 rounded-tl-none shadow-sm"
                }`}
              >
                <p>{message?.message}</p>
                <p
                  className={`text-xs ${
                    message.userId === user?._id
                      ? "text-slate-600"
                      : "text-gray-600"
                  } text-right mt-1`}
                >
                  {formatTime(message?.createdAt || message?.time)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No messages yet</p>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <footer className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center space-x-2"
        >
          <div className="flex-1 relative">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message"
              className="w-full py-2 pl-4 pr-12 text-slate-600 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={!messageText?.trim()}
            className={`p-2 rounded-full ${
              messageText?.trim()
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "text-gray-400 cursor-not-allowed"
            }`}
          >
            <IoIosSend size={22} />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default Chat;
