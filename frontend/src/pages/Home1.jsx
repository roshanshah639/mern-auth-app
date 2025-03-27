import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Chat from "../components/Chat";
import { FiMenu } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";

const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(`${import.meta.env.VITE_API_BASE_URL}`, {
      withCredentials: true,
      auth: { token: localStorage.getItem("token") },
      autoConnect: true,
    });

    setSocket(newSocket);

    if (user && user?._id) {
      newSocket.emit("AddUserSocket", user._id);
    }

    // clean up on component unmount
    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const [showSidebar, setShowSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowSidebar(true);
      }
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative h-screen w-full bg-white">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[url('https://wallpapercave.com/wp/wp14199753.png')] bg-cover bg-center opacity-5" />

      {/* Layout container */}
      <div className="relative h-full w-full flex">
        {/* Sidebar - controlled visibility */}
        <aside
          className={`fixed md:relative z-20 w-72 h-full bg-white md:bg-rose-50 shadow-lg md:shadow-none
            transform transition-transform duration-300 ease-in-out
            ${
              showSidebar
                ? "translate-x-0"
                : "-translate-x-full md:translate-x-0"
            }`}
        >
          <Sidebar
            socket={socket}
            onClose={() => setShowSidebar(false)}
            isMobile={isMobile}
          />
        </aside>

        {/* Main chat area */}
        <main className="flex-1 h-full overflow-hidden flex flex-col">
          {/* Mobile header - only shown on small screens */}
          {isMobile && (
            <header className="sticky top-0 z-10 flex items-center p-3 bg-white border-b border-gray-200">
              <button
                onClick={() => setShowSidebar(true)}
                className="p-2 rounded-md text-gray-600 hover:text-indigo-600 hover:bg-gray-100"
                aria-label="Open sidebar"
              >
                <FiMenu className="h-5 w-5" />
              </button>
              <h1 className="ml-3 text-lg font-medium text-gray-800">Chat</h1>
            </header>
          )}

          {/* Chat component */}
          <div className="flex-1 overflow-hidden">
            <Chat socket={socket} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
