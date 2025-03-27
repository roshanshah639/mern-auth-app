import React, { useState, useEffect, useRef } from "react";
import { IoIosLogOut, IoIosSearch } from "react-icons/io";
import { CiHome, CiUser } from "react-icons/ci";
import { FiX } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/Slice/AuthSlice";
import axios from "axios";
import toast from "react-hot-toast";
import {
  removeSelectedUser,
  setSelectedUser,
} from "../redux/Slice/SelectedUser";

const Sidebar = ({ onClose, isMobile, socket }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch all users
  const getUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/users/all-users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response?.data?.success) {
        setUsers(response.data.data || []);
        console.log("Fetched users:", response.data.data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter users based on search query and exclude current user
  const filteredUsers = users
    .filter((currentUser) => currentUser._id !== user?._id)
    .filter(
      (u) =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.phoneNumber?.includes(searchQuery)
    );

  // Check if user is online based on socket data
  const isUserOnline = (userId) => {
    const isOnline = onlineUsers.some(
      (onlineUser) => onlineUser.userId === userId
    );
    console.log(
      `Checking online status for user ${userId}:`,
      isOnline,
      "Online users:",
      onlineUsers
    );
    return isOnline;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isDropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  // Load users on component mount and when authenticated
  useEffect(() => {
    if (isAuthenticated && socket) {
      getUsers();
    }
  }, [isAuthenticated, socket]);

  // Socket handling for online users
  useEffect(() => {
    if (socket && isAuthenticated && user) {
      // Ensure socket is connected before proceeding
      socket.on("connect", () => {
        console.log("Socket connected in Sidebar:", socket.id);
        socket.emit("AddUserSocket", user._id);
      });

      // Listen for online users
      const handleGetUsers = (users) => {
        console.log("Received online users:", users);
        setOnlineUsers(users || []);
      };

      socket.on("getUsers", handleGetUsers);

      // Handle socket errors
      socket.on("connect_error", (error) => {
        console.error("Socket connection error in Sidebar:", error);
        toast.error("Failed to connect to server");
      });

      // Request initial online users
      socket.emit("AddUserSocket", user._id);

      // Cleanup
      return () => {
        socket.off("connect");
        socket.off("getUsers", handleGetUsers);
        socket.off("connect_error");
      };
    }
  }, [socket, isAuthenticated, user]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle logout
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token");

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      toast.success(response?.data?.message || "Logged out successfully");
      localStorage.removeItem("token");
      dispatch(logout());
      dispatch(removeSelectedUser());

      if (socket) {
        socket.disconnect();
      }

      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(error.response?.data?.message || "Logout failed");
    } finally {
      setIsDropdownOpen(false);
    }
  };

  // Handle user selection
  const handleUserSelect = (user) => {
    dispatch(setSelectedUser(user));
    if (isMobile) onClose();
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Sidebar header with close button only for mobile */}
      <div className="px-4 py-4 border-b border-gray-200 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-700">Chat App</h1>
        {isMobile && (
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-500 hover:text-indigo-600 hover:bg-gray-100 md:hidden"
            aria-label="Close sidebar"
          >
            <FiX size={20} />
          </button>
        )}
      </div>

      {/* Search and profile */}
      <div className="px-4 py-4 flex items-center justify-between space-x-3 bg-gray-50">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IoIosSearch className="h-4 w-4 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-slate-600
                      placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 
                      focus:border-indigo-500"
            placeholder="Search users..."
            value={searchQuery}
            onChange={handleSearchChange}
            aria-label="Search users"
          />
        </div>

        <div className="profile-dropdown relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center justify-center rounded-full border-2 border-indigo-500 
                      focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
            aria-label="User menu"
          >
            <img
              src={
                user?.profile
                  ? user.profile
                  : "https://randomuser.me/api/portraits/men/1.jpg"
              }
              alt="User profile"
              className="h-8 w-8 rounded-full object-cover"
            />
          </button>

          {isDropdownOpen && (
            <div
              className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white 
                        ring-1 ring-rose-200 ring-opacity-5 focus:outline-none z-10"
            >
              <div className="py-1" role="menu" aria-orientation="vertical">
                <Link
                  to="/"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  <CiHome className="mr-2" aria-hidden="true" />
                  Home
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  <CiUser className="mr-2" aria-hidden="true" />
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  <IoIosLogOut className="mr-2" aria-hidden="true" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Users list */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-3">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Online Users (
            {filteredUsers.filter((u) => isUserOnline(u._id)).length})
          </h2>
          <ul className="space-y-2" role="list">
            {isLoading ? (
              <li className="text-sm text-gray-500">Loading users...</li>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <li
                  key={user._id}
                  className="flex items-center p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  role="listitem"
                  onClick={() => handleUserSelect(user)}
                >
                  <div className="relative">
                    <img
                      src={
                        user.profile ||
                        "https://randomuser.me/api/portraits/men/1.jpg"
                      }
                      alt={`${user.name}'s avatar`}
                      className="h-9 w-9 rounded-full object-cover border-2 border-indigo-500"
                    />
                    {isUserOnline(user._id) && (
                      <span
                        className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-white"
                        aria-label="User online"
                      ></span>
                    )}
                  </div>
                  <div className="ml-3 overflow-hidden">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.phoneNumber || "No phone"}
                    </p>
                  </div>
                </li>
              ))
            ) : (
              <li className="text-sm text-gray-500">No users found</li>
            )}
          </ul>
        </div>
      </div>

      {/* Sidebar footer */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center">
          <img
            src={
              user?.profile || "https://randomuser.me/api/portraits/men/1.jpg"
            }
            alt="User profile"
            className="h-8 w-8 rounded-full object-cover"
          />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              {user?.name || "Guest"}
            </p>
            <p className="text-xs text-gray-500">Active now</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
