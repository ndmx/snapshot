import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import './Messages.css';

function Messages({ onClose }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Listen to conversations where current user is a participant
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', auth.currentUser.uid),
      orderBy('lastMessageTime', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setConversations(convos);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedConversation) return;

    // Listen to messages in selected conversation
    const messagesRef = collection(db, 'conversations', selectedConversation.id, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [selectedConversation]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await addDoc(
        collection(db, 'conversations', selectedConversation.id, 'messages'),
        {
          text: newMessage,
          senderId: auth.currentUser.uid,
          senderUsername: auth.currentUser.displayName || auth.currentUser.email.split('@')[0],
          timestamp: serverTimestamp()
        }
      );

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name[0].toUpperCase();
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participantNames?.find(
      name => name !== (auth.currentUser.displayName || auth.currentUser.email.split('@')[0])
    ) || 'User';
  };

  return (
    <div className="messages-overlay" onClick={onClose}>
      <div className="messages-panel" onClick={(e) => e.stopPropagation()}>
        {!selectedConversation ? (
          <>
            <div className="messages-header">
              <h2>{auth.currentUser.displayName || 'Messages'}</h2>
            </div>

            <div className="conversations-list">
              {loading && <div className="messages-loading">Loading...</div>}
              
              {!loading && conversations.length === 0 && (
                <div className="no-messages">
                  <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/>
                  </svg>
                  <h3>Your messages</h3>
                  <p>Send private photos and messages to a friend</p>
                </div>
              )}

              {conversations.map((convo) => (
                <div
                  key={convo.id}
                  className="conversation-item"
                  onClick={() => setSelectedConversation(convo)}
                >
                  <div className="convo-avatar">
                    {getInitials(getOtherParticipant(convo))}
                  </div>
                  <div className="convo-details">
                    <span className="convo-name">{getOtherParticipant(convo)}</span>
                    <span className="convo-last-message">
                      {convo.lastMessage || 'Start a conversation'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="messages-header">
              <button onClick={() => setSelectedConversation(null)} className="back-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              <div className="chat-user-info">
                <div className="chat-avatar">
                  {getInitials(getOtherParticipant(selectedConversation))}
                </div>
                <span className="chat-username">{getOtherParticipant(selectedConversation)}</span>
              </div>
            </div>

            <div className="messages-content">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message ${msg.senderId === auth.currentUser.uid ? 'sent' : 'received'}`}
                >
                  <div className="message-bubble">
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={sendMessage} className="message-input-form">
              <input
                type="text"
                placeholder="Message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="message-input"
              />
              <button type="submit" disabled={!newMessage.trim()} className="send-btn">
                Send
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default Messages;

