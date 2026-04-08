import React, { useState, useEffect, useContext, useRef } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosConfig';
import { io } from 'socket.io-client';
import { Send } from 'lucide-react';
import moment from 'moment';

const BASE_URL = 'http://localhost:5000';

const MessagesPage = () => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('primary'); // 'primary' or 'requests'
  const socket = useRef();
  const scrollRef = useRef();

  useEffect(() => {
    socket.current = io(BASE_URL);
    socket.current.on('getMessage', (data) => {
      setArrivalMessage({
        _id: data._id,
        sender: data.sender,
        text: data.text,
        status: data.status,
        createdAt: data.createdAt,
        conversationId: data.conversationId
      });
    });

    socket.current.on('messageStatusUpdate', ({ messageId, status }) => {
      setMessages((prev) => prev.map(m => m._id === messageId ? { ...m, status } : m));
    });
  }, []);

  useEffect(() => {
    if (arrivalMessage && currentChat?._id === arrivalMessage.conversationId) {
      setMessages((prev) => [...prev, arrivalMessage]);
      // Mark as seen automatically if we have the chat open
      if (arrivalMessage.sender !== user.id) {
         api.put('/messages/seen/' + arrivalMessage.conversationId);
         socket.current.emit("updateMessageStatus", { 
           senderId: arrivalMessage.sender, 
           receiverId: user.id, 
           messageId: arrivalMessage._id, 
           status: "seen" 
         });
      }
    }
  }, [arrivalMessage, currentChat, user.id]);

  useEffect(() => {
    socket.current.emit('addUser', user?.id);
  }, [user]);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations');
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    const getMessages = async () => {
      if (!currentChat) return;
      try {
        const res = await api.get('/messages/' + currentChat._id);
        setMessages(res.data);
        
        // When opening the chat, ping backend to mark all unseen as seen
        const hasUnseen = res.data.some(m => m.sender !== user.id && m.status !== 'seen');
        if (hasUnseen) {
          await api.put('/messages/seen/' + currentChat._id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    getMessages();
  }, [currentChat]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const receiverId = currentChat.members.find((member) => member._id !== user.id)._id;

    try {
      const res = await api.post('/messages', {
        conversationId: currentChat._id,
        text: newMessage,
        receiverId
      });

      // Emit through socket with saved ID
      socket.current.emit('sendMessage', {
        senderId: user.id,
        receiverId,
        text: newMessage,
        conversationId: currentChat._id,
        messageId: res.data._id
      });
      setMessages([...messages, res.data]);
      setNewMessage('');
      
      // Update local last message for UI
      setConversations(prev => prev.map(c => {
        if(c._id === currentChat._id) {
          return { ...c, lastMessage: { text: res.data.text } };
        }
        return c;
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptRequest = async () => {
    try {
      await api.put('/messages/accept/' + currentChat._id);
      setCurrentChat({ ...currentChat, isRequest: false });
      fetchConversations();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBlockUser = async () => {
    try {
      const friendId = currentChat.members.find(m => m._id !== user.id)._id;
      await api.put(`/users/block/${friendId}`);
      alert("User has been blocked. They can no longer send you messages.");
      setCurrentChat(null);
      fetchConversations();
    } catch (err) {
      alert("Failed to block user.");
    }
  };

  const filteredConvos = conversations.filter(c => {
    // If you started it, it's never a request for you.
    const isSender = c.members[0]._id === user.id;
    if (activeTab === 'requests') {
       return c.isRequest && !isSender;
    }
    return !c.isRequest || isSender;
  });

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-100px)] glass-card overflow-hidden">
        {/* Left pane: Conversations */}
        <div className="w-1/3 border-r border-[var(--glass-border)] flex flex-col">
          <div className="p-4 border-b border-[var(--glass-border)] flex justify-between items-center bg-black/20">
            <button 
               onClick={() => setActiveTab('primary')} 
               className={`flex-1 text-center font-bold pb-2 transition-all ${activeTab === 'primary' ? 'text-white border-b-2 border-[var(--neon-cyan)]' : 'text-gray-500'}`}
            >
              Messages
            </button>
            <button 
               onClick={() => setActiveTab('requests')} 
               className={`flex-1 text-center font-bold pb-2 transition-all relative ${activeTab === 'requests' ? 'text-white border-b-2 border-[var(--neon-pink)]' : 'text-gray-500'}`}
            >
              Requests
            </button>
          </div>
          <div className="overflow-y-auto flex-1">
            {filteredConvos.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  {activeTab === 'requests' ? "No pending message requests." : "No messages yet. Use Search to connect."}
                </div>
            ) : null}
            {filteredConvos.map((c) => {
              const friend = c.members.find((m) => m._id !== user?.id);
              return (
                <div 
                  key={c._id} 
                  onClick={() => setCurrentChat(c)}
                  className={`p-4 border-b border-[var(--glass-border)] cursor-pointer hover:bg-white/5 transition-colors flex items-center gap-3 ${currentChat?._id === c._id ? 'bg-white/10' : ''}`}
                >
                  <div className="w-10 h-10 rounded-full bg-[var(--neon-purple)] flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {friend?.avatar ? <img src={`${BASE_URL}${friend.avatar}`} alt="av" className="w-full h-full object-cover" /> : friend?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-white truncate text-sm">{friend?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{c.isRequest && activeTab === 'requests' ? <span className="text-[var(--neon-pink)] font-bold">Wants to message you</span> : c.lastMessage?.text || "Started conversation"}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right pane: Chat */}
        <div className="flex-1 flex flex-col relative">
          {currentChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-[var(--glass-border)] font-bold text-lg text-white flex items-center justify-between bg-black/40">
                <div className="flex items-center gap-3">
                  <span className="font-bold">{currentChat.members.find(m => m._id !== user.id)?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleBlockUser} className="text-xs px-3 py-1 bg-red-500/20 border border-red-500 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors">Block</button>
                  {currentChat.isRequest && (
                    <span className="text-xs px-3 py-1 bg-[var(--neon-pink)]/20 border border-[var(--neon-pink)] text-[var(--neon-pink)] rounded-full">Request</span>
                  )}
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentChat.isRequest && currentChat.members[1]._id === user.id ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <p className="text-gray-400 text-center">This is a message request. They are not in your following list.</p>
                    <button onClick={handleAcceptRequest} className="btn-neon btn-neon-primary px-6 py-2">Accept Request</button>
                  </div>
                ) : (
                  messages.map((m, idx) => (
                    <div key={idx} ref={scrollRef} className={`flex ${m.sender === user.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-3 rounded-2xl ${m.sender === user.id ? 'bg-[var(--neon-purple)] text-white rounded-br-none shadow-[0_0_15px_rgba(155,81,224,0.3)]' : 'bg-white/10 text-gray-200 rounded-bl-none border border-[var(--glass-border)]'}`}>
                        <p>{m.text}</p>
                        <div className="flex justify-end items-center gap-1 mt-1">
                          <p className="text-[10px] text-white/50">{moment(m.createdAt).format('LT')}</p>
                          {m.sender === user.id && (
                             <span className="text-[10px] ml-1 font-bold">
                               {m.status === 'seen' ? '🔵' : (m.status === 'delivered' ? '✓✓' : '✓')}
                             </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Chat Input */}
              {(!currentChat.isRequest || currentChat.members[0]._id === user.id) && (
                <form onSubmit={handleSubmit} className="p-4 border-t border-[var(--glass-border)] flex gap-2">
                  <input
                    className="flex-1 input-glass !py-3"
                    placeholder="Transmit message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button type="submit" disabled={!newMessage.trim()} className="bg-[var(--neon-cyan)] text-black px-4 rounded-xl disabled:opacity-50 hover:bg-white transition-colors">
                    <Send className="w-5 h-5 ml-0.5" />
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 font-bold text-lg">
              Open a direct message to start chatting.
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default MessagesPage;
