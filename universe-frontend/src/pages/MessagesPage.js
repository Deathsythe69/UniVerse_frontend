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
  const socket = useRef();
  const scrollRef = useRef();

  useEffect(() => {
    socket.current = io(BASE_URL);
    socket.current.on('getMessage', (data) => {
      setArrivalMessage({
        sender: data.sender,
        text: data.text,
        createdAt: data.createdAt,
        conversationId: data.conversationId
      });
    });
  }, []);

  useEffect(() => {
    if (arrivalMessage && currentChat?._id === arrivalMessage.conversationId) {
      setMessages((prev) => [...prev, arrivalMessage]);
    }
  }, [arrivalMessage, currentChat]);

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

    socket.current.emit('sendMessage', {
      senderId: user.id,
      receiverId,
      text: newMessage,
      conversationId: currentChat._id
    });

    try {
      const res = await api.post('/messages', {
        conversationId: currentChat._id,
        text: newMessage,
        receiverId
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

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-100px)] glass-card overflow-hidden">
        {/* Left pane: Conversations */}
        <div className="w-1/3 border-r border-[var(--glass-border)] flex flex-col">
          <div className="p-4 border-b border-[var(--glass-border)] font-bold text-lg text-white">
            Comms Channels
          </div>
          <div className="overflow-y-auto flex-1">
            {conversations.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">No channels yet. Use Search to connect.</div>
            ) : null}
            {conversations.map((c) => {
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
                    <p className="text-xs text-gray-400 truncate">{c.isRequest ? <span className="text-[var(--neon-pink)]">Message Request pending...</span> : c.lastMessage?.text || "Started conversation"}</p>
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
              <div className="p-4 border-b border-[var(--glass-border)] font-bold text-lg text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-bold">{currentChat.members.find(m => m._id !== user.id)?.name}</span>
                </div>
                {currentChat.isRequest && (
                  <span className="text-xs px-3 py-1 bg-[var(--neon-pink)]/20 border border-[var(--neon-pink)] text-[var(--neon-pink)] rounded-full">Request</span>
                )}
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
                      <div className={`max-w-[70%] p-3 rounded-2xl ${m.sender === user.id ? 'bg-[var(--neon-purple)] text-white rounded-br-none' : 'bg-white/10 text-gray-200 rounded-bl-none'}`}>
                        <p>{m.text}</p>
                        <p className="text-[10px] text-white/50 text-right mt-1">{moment(m.createdAt).format('LT')}</p>
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
              Open a channel to start transmitting.
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default MessagesPage;
