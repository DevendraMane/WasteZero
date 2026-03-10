import React, { useState, useMemo, useEffect } from "react";
import { useAuth } from "../../store/AuthContext";
import { useSearchParams } from "react-router-dom";

const UserMessages = () => {
  const { user, API, authorizationToken } = useAuth();

  const [searchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");

  /* ================= FETCH CONVERSATIONS ================= */

  const fetchConversations = async () => {
    const res = await fetch(`${API}/api/messages/conversations`, {
      headers: { Authorization: authorizationToken },
    });

    const data = await res.json();
    console.log("Conversations API:", data);
    if (Array.isArray(data)) {
      setConversations(data);
    } else {
      setConversations([]);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  /* ================= AUTO OPEN CHAT FROM URL ================= */

  useEffect(() => {
    const userId = searchParams.get("user");

    if (userId) {
      loadMessages(userId);
    }
  }, []);

  /* ================= LOAD MESSAGES ================= */

  const loadMessages = async (userId) => {
    setSelectedUser(userId);

    const res = await fetch(`${API}/api/messages/${userId}`, {
      headers: { Authorization: authorizationToken },
    });

    const data = await res.json();
    setMessages(data);
  };

  /* ================= SEND MESSAGE ================= */

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    const res = await fetch(`${API}/api/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorizationToken,
      },
      body: JSON.stringify({
        receiver_id: selectedUser,
        content: newMessage,
      }),
    });

    const data = await res.json();

    setMessages((prev) => [...prev, data]);
    setNewMessage("");

    fetchConversations(); // refresh left panel
  };

  /* ================= SEARCH FILTER ================= */

  const filteredChats = useMemo(() => {
    if (!Array.isArray(conversations)) return [];

    return conversations.filter((c) =>
      (c.user?.name || "").toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, conversations]);

  return (
    <div className="flex h-[80vh] bg-white rounded-2xl shadow overflow-hidden">
      {/* LEFT PANEL */}

      <div className="w-1/3 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b bg-white">
          <h2 className="text-lg font-semibold mb-3">Messages</h2>

          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((conv) => {
            const otherUser = conv.user?._id;

            return (
              <div
                key={conv._id}
                onClick={() => loadMessages(otherUser)}
                className={`p-4 cursor-pointer hover:bg-gray-100 border-b ${
                  selectedUser === otherUser ? "bg-green-100" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      conv.user?.profileImage
                        ? conv.user.profileImage
                        : `https://ui-avatars.com/api/?name=${conv.user?.name}`
                    }
                    className="w-8 h-8 rounded-full"
                  />

                  <div>
                    <p className="font-medium text-sm">{conv.user?.name}</p>

                    <p className="text-xs text-gray-500 truncate">
                      {conv.lastMessage}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANEL */}

      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* CHAT BODY */}

            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50">
              {messages.map((msg, i) => {
                const isMe = msg.sender_id?.toString() === user._id;

                return (
                  <div
                    key={i}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`px-4 py-2 rounded-xl max-w-xs text-sm ${
                        isMe ? "bg-green-600 text-white" : "bg-white shadow"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* INPUT */}

            <div className="p-4 border-t flex gap-2 bg-white">
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 border rounded-full px-4 py-2"
              />

              <button
                onClick={handleSend}
                className="bg-green-600 text-white px-4 py-2 rounded-full"
              >
                Send
              </button>
            </div>
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

export default UserMessages;
