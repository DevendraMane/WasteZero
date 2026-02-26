import React, { useState, useMemo } from "react";
import { useAuth } from "../../store/AuthContext";

const Messages = () => {
  const { user } = useAuth();

  const [selectedChat, setSelectedChat] = useState(0);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [starred, setStarred] = useState(false);
  const [muted, setMuted] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const dummyChats = {
    volunteer: [
      {
        id: 1,
        name: "Green Earth NGO - Hyderabad",
        date: "5/9/2025",
        messages: [
          {
            sender: "them",
            text: "Hello! We are organizing a beach cleanup drive.",
          },
          { sender: "me", text: "That sounds great. What time does it start?" },
          { sender: "them", text: "Sunday at 9 AM." },
          { sender: "me", text: "Perfect. I will join." },
        ],
      },
      {
        id: 2,
        name: "Eco Mitra Foundation - Vijayawada",
        date: "5/8/2025",
        messages: [
          { sender: "them", text: "Your pickup request has been confirmed." },
          { sender: "me", text: "Thank you for the update." },
        ],
      },
      {
        id: 3,
        name: "Swachh Bharat Volunteers - Guntur",
        date: "5/7/2025",
        messages: [
          {
            sender: "them",
            text: "We have a tree plantation drive this weekend.",
          },
          { sender: "me", text: "Can you share the location details?" },
        ],
      },
      {
        id: 4,
        name: "Plastic Free Telangana",
        date: "5/6/2025",
        messages: [
          {
            sender: "them",
            text: "Thank you for your contribution to our campaign.",
          },
        ],
      },
      {
        id: 5,
        name: "Recycle Smart India",
        date: "5/5/2025",
        messages: [
          { sender: "them", text: "Your waste statistics have been updated." },
        ],
      },
      {
        id: 6,
        name: "Pickup Agent - Ravi Kumar",
        date: "5/4/2025",
        messages: [
          { sender: "them", text: "I have arrived at your location." },
          { sender: "me", text: "I will be there in two minutes." },
        ],
      },
      {
        id: 7,
        name: "Clean Rivers Initiative",
        date: "5/3/2025",
        messages: [
          {
            sender: "them",
            text: "We need volunteers for a river cleanup drive.",
          },
        ],
      },
      {
        id: 8,
        name: "Urban Waste Solutions",
        date: "5/2/2025",
        messages: [
          {
            sender: "them",
            text: "Workshop on waste segregation is scheduled.",
          },
        ],
      },
      {
        id: 9,
        name: "Green Future Trust",
        date: "5/1/2025",
        messages: [
          { sender: "them", text: "Volunteer registration is now open." },
        ],
      },
    ],

    ngo: [
      {
        id: 1,
        name: "Ruthwik Reddy",
        date: "5/9/2025",
        messages: [
          {
            sender: "them",
            text: "I have applied for your volunteering event.",
          },
          {
            sender: "me",
            text: "Application approved. Please arrive by 9 AM.",
          },
        ],
      },
      {
        id: 2,
        name: "Anjali Devi",
        date: "5/8/2025",
        messages: [
          { sender: "them", text: "Is prior experience required?" },
          { sender: "me", text: "No experience required. Just enthusiasm!" },
        ],
      },
      {
        id: 3,
        name: "Rahul Teja",
        date: "5/7/2025",
        messages: [
          { sender: "them", text: "What is the duration of the event?" },
          { sender: "me", text: "Approximately three hours." },
        ],
      },
      {
        id: 4,
        name: "Sneha Lakshmi",
        date: "5/6/2025",
        messages: [
          { sender: "them", text: "Can I bring my friends along?" },
          { sender: "me", text: "Yes, you may bring up to two friends." },
        ],
      },
      {
        id: 5,
        name: "Vikram Chowdary",
        date: "5/5/2025",
        messages: [
          { sender: "them", text: "Could you please share the location?" },
        ],
      },
      {
        id: 6,
        name: "Arjun Varma",
        date: "5/4/2025",
        messages: [
          { sender: "them", text: "What should we bring for the event?" },
          { sender: "me", text: "Please bring gloves and a water bottle." },
        ],
      },
      {
        id: 7,
        name: "Sravani Priya",
        date: "5/3/2025",
        messages: [
          { sender: "them", text: "Is it okay if I arrive a little late?" },
        ],
      },
      {
        id: 8,
        name: "Mahesh Babu",
        date: "5/2/2025",
        messages: [
          { sender: "them", text: "Please confirm the pickup schedule." },
        ],
      },
      {
        id: 9,
        name: "Kiran Kumar",
        date: "5/1/2025",
        messages: [
          { sender: "them", text: "Can you send the full event details?" },
        ],
      },
    ],

    admin: [
      {
        id: 1,
        name: "Ruthwik ↔ Green Earth NGO",
        date: "5/9/2025",
        messages: [{ sender: "them", text: "Conversation under monitoring." }],
      },
      {
        id: 2,
        name: "Anjali ↔ Eco Mitra",
        date: "5/8/2025",
        messages: [{ sender: "them", text: "No policy violations detected." }],
      },
      {
        id: 3,
        name: "Rahul ↔ Swachh Bharat",
        date: "5/7/2025",
        messages: [
          { sender: "them", text: "Reported message reviewed successfully." },
        ],
      },
      {
        id: 4,
        name: "Sneha ↔ Plastic Free Telangana",
        date: "5/6/2025",
        messages: [{ sender: "them", text: "Monitoring activity ongoing." }],
      },
      {
        id: 5,
        name: "System Alert",
        date: "5/5/2025",
        messages: [
          {
            sender: "them",
            text: "A new user has registered on the platform.",
          },
        ],
      },
    ],
  };

  const roleChats = dummyChats[user?.role] || [];

  const filteredChats = useMemo(() => {
    return roleChats.filter((chat) =>
      chat.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, roleChats]);

  const handleSend = () => {
    if (!newMessage.trim() || blocked) return;

    roleChats[selectedChat].messages.push({
      sender: "me",
      text: newMessage,
    });

    setNewMessage("");
  };

  const currentChat = filteredChats[selectedChat];

  return (
    <div className="flex h-[80vh] bg-white rounded-2xl shadow overflow-hidden">
      {/* LEFT PANEL */}
      <div className="w-1/3 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b bg-white">
          <h2 className="text-lg font-semibold mb-3">Messages</h2>
          <input
            type="text"
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat, index) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(index)}
              className={`p-4 cursor-pointer hover:bg-gray-100 border-b ${
                selectedChat === index ? "bg-green-100" : ""
              }`}
            >
              <div className="flex justify-between">
                <p className="font-medium text-sm">{chat.name}</p>
                <span className="text-xs text-gray-500">{chat.date}</span>
              </div>
              <p className="text-xs text-gray-500 truncate">
                {chat.messages[chat.messages.length - 1]?.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <>
            {/* HEADER */}
            <div className="p-4 border-b bg-white flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{currentChat.name}</h3>
                {starred && (
                  <span className="text-yellow-500 text-xs">⭐ Starred</span>
                )}
                {muted && (
                  <span className="text-gray-400 text-xs ml-2">🔕 Muted</span>
                )}
              </div>

              {/* 3 DOT MENU */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="text-xl px-3 py-1 hover:bg-gray-100 rounded"
                >
                  ⋮
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg text-sm z-50">
                    <button
                      onClick={() => {
                        setStarred(!starred);
                        setShowMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      ⭐ {starred ? "Unstar Chat" : "Star Chat"}
                    </button>

                    {user?.role !== "admin" && (
                      <>
                        <button
                          onClick={() => {
                            setMuted(!muted);
                            setShowMenu(false);
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          🔕 {muted ? "Unmute" : "Mute Notifications"}
                        </button>

                        <button
                          onClick={() => {
                            setBlocked(!blocked);
                            setShowMenu(false);
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          🚫 {blocked ? "Unblock User" : "Block User"}
                        </button>

                        <button
                          onClick={() => {
                            roleChats[selectedChat].messages = [];
                            setShowMenu(false);
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                        >
                          🗑 Clear Chat
                        </button>
                      </>
                    )}

                    {user?.role === "admin" && (
                      <>
                        <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                          🚨 Flag Conversation
                        </button>
                        <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500">
                          🛑 Suspend User
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* CHAT BODY */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50">
              {blocked && (
                <div className="text-center text-red-500 text-sm">
                  🚫 You have blocked this user.
                </div>
              )}

              {currentChat.messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.sender === "me" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-4 py-2 rounded-xl max-w-xs text-sm ${
                      msg.sender === "me"
                        ? "bg-green-600 text-white"
                        : "bg-white shadow"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* INPUT */}
            {user?.role !== "admin" && !blocked && (
              <div className="p-4 border-t flex gap-2 bg-white">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 border rounded-full px-4 py-2 focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleSend}
                  className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700"
                >
                  ➤
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
