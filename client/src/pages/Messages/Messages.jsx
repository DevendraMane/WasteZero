import React, { useState } from "react";

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState(0);
  const [newMessage, setNewMessage] = useState("");

  const chats = [
    {
      id: 1,
      name: "NGO Coordinator",
      messages: [
        { sender: "them", text: "Hello! We need volunteers for cleanup." },
        { sender: "me", text: "Sure, how many people required?" },
      ],
    },
    {
      id: 2,
      name: "Admin",
      messages: [
        { sender: "them", text: "Please update opportunity details." },
      ],
    },
  ];

  const handleSend = () => {
    if (!newMessage.trim()) return;

    chats[selectedChat].messages.push({
      sender: "me",
      text: newMessage,
    });

    setNewMessage("");
  };

  return (
    <div className="flex h-[75vh] bg-white rounded-2xl shadow-md overflow-hidden">
      {/* LEFT PANEL */}
      <div className="w-1/3 border-r bg-gray-50">
        <div className="p-5 border-b">
          <h2 className="text-xl font-semibold">Messages</h2>
        </div>

        {chats.map((chat, index) => (
          <div
            key={chat.id}
            onClick={() => setSelectedChat(index)}
            className={`p-4 cursor-pointer hover:bg-gray-100 transition ${
              selectedChat === index ? "bg-green-100" : ""
            }`}
          >
            <p className="font-medium">{chat.name}</p>
          </div>
        ))}
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col">
        {/* CHAT HEADER */}
        <div className="p-5 border-b">
          <h3 className="font-semibold">{chats[selectedChat].name}</h3>
        </div>

        {/* CHAT BODY */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50">
          {chats[selectedChat].messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.sender === "me" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-xl max-w-xs ${
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

        {/* MESSAGE INPUT */}
        <div className="p-4 border-t flex gap-3">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
          />

          <button
            onClick={handleSend}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Messages;
