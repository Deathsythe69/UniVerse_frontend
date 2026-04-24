import React, { useState, useEffect, useContext, useRef } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosConfig';
import { io } from 'socket.io-client';
import { Send, ShieldOff } from 'lucide-react';
import moment from 'moment';

const BASE_URL = 'http://localhost:5000';

const MessagesPage = () => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [arrivalMessage, setArrivalMessage] = useState(null);
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
  }, [currentChat, user?.id]);

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

  const handleBlockUser = async () => {
    try {
      const friendId = currentChat.members.find(m => m._id !== user.id)._id;
      await api.put(`/users/block/${friendId}`);
      alert("User has been blocked. Comms link severed.");
      setCurrentChat(null);
      fetchConversations();
    } catch (err) {
      alert("Failed to block user.");
    }
  };

  const filteredConvos = conversations.filter(c => !c.isRequest);

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-100px)] glass-card overflow-hidden">
        {/* Left pane: Conversations */}
        <div className="w-1/3 border-r border-[var(--outline-variant)] flex flex-col surface-low">
          <div className="p-5 border-b border-[var(--outline-variant)]">
            <h2 className="text-xl font-bold gradient-text-spectral tracking-wide">Comms Log</h2>
          </div>
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {filteredConvos.length === 0 ? (
                <div className="p-8 text-center text-sm text-[var(--on-surface-variant)] leading-relaxed">
                  No active frequencies.<br/>Mutual follows sync comms channels.
                </div>
            ) : null}
            {filteredConvos.map((c) => {
              const friend = c.members.find((m) => m._id !== user?.id);
              return (
                <div 
                  key={c._id} 
                  onClick={() => setCurrentChat(c)}
                  className={`p-4 border-b border-[var(--outline-variant)]/50 cursor-pointer hover:bg-[var(--surface-bright)] transition-colors flex items-center gap-4 ${currentChat?._id === c._id ? 'bg-[var(--surface-container-highest)] border-l-4 border-l-[var(--primary)] pl-3' : ''}`}
                >
                  <div className="w-12 h-12 rounded-full border border-[var(--outline-variant)] flex-shrink-0 flex items-center justify-center overflow-hidden bg-[var(--surface-container)] text-[var(--on-surface)] shadow-md">
                    {friend?.avatar ? <img src={`${BASE_URL}${friend.avatar}`} alt="av" className="w-full h-full object-cover" /> : friend?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-baseline mb-1">
                      <p className="font-bold text-[var(--on-surface)] truncate text-sm">{friend?.name}</p>
                    </div>
                    <p className="text-xs text-[var(--on-surface-variant)] truncate">{c.lastMessage?.text || "Channel open"}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right pane: Chat */}
        <div className="flex-1 flex flex-col relative surface-base">
          {currentChat ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-[var(--outline-variant)] flex items-center justify-between surface-high">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#00FF41] shadow-[0_0_8px_#00FF41] animate-pulse"></div>
                  <span className="font-bold text-[var(--on-surface)]">{currentChat.members.find(m => m._id !== user.id)?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleBlockUser} className="text-xs px-4 py-2 font-bold surface-highest border border-[var(--error)] text-[var(--error)] rounded-full hover:bg-[var(--error)] hover:text-white transition-all flex items-center gap-2">
                    <ShieldOff className="w-3 h-3" /> Block Channel
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
                {messages.map((m, idx) => (
                  <div key={idx} ref={scrollRef} className={`flex ${m.sender === user.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] p-4 rounded-2xl relative ${m.sender === user.id ? 'bg-[var(--secondary-container)] text-[var(--on-secondary)] rounded-br-sm shadow-[0_4px_20px_rgba(103,15,172,0.2)]' : 'surface-highest ghost-border text-[var(--on-surface)] rounded-bl-sm'}`}>
                      <p className="text-[15px] leading-relaxed break-words">{m.text}</p>
                      <div className="flex justify-end items-center gap-1.5 mt-2">
                        <p className={`text-[10px] font-bold tracking-wide uppercase opacity-70 ${m.sender === user.id ? 'text-[var(--on-secondary)]' : 'text-[var(--on-surface-variant)]'}`}>{moment(m.createdAt).format('LT')}</p>
                        {m.sender === user.id && (
                           <span className="text-[10px] ml-1 font-bold">
                             {m.status === 'seen' ? <span className="text-[var(--primary)] drop-shadow-[0_0_2px_#3dc2fd]">✓✓</span> : (m.status === 'delivered' ? '✓✓' : '✓')}
                           </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSubmit} className="p-4 border-t border-[var(--outline-variant)] flex gap-3 surface-highest">
                  <input
                    className="flex-1 input-glass"
                    placeholder="Enter frequency message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button type="submit" disabled={!newMessage.trim()} className="w-12 h-12 flex-shrink-0 flex items-center justify-center btn-neon-primary rounded-xl disabled:opacity-50 transition-all hover:scale-105 active:scale-95 group/btn">
                    <Send className="w-5 h-5 ml-[-2px] mt-[1px] text-white group-hover/btn:drop-shadow-[0_0_8px_white]" />
                  </button>
                </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 relative overflow-hidden">
               {/* Ambient background decoration */}
               <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                 <ShieldOff className="w-[400px] h-[400px] text-white" />
               </div>
               <div className="w-16 h-16 rounded-full border border-[var(--outline-variant)] flex items-center justify-center bg-[var(--surface-highest)]">
                 <Send className="w-6 h-6 text-[var(--on-surface-variant)]" />
               </div>
               <p className="text-[var(--on-surface-variant)] font-bold text-lg tracking-wide z-10">
                 Establish a comms link to begin.
               </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default MessagesPage;
