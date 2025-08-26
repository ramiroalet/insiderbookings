"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { Search, Send, User } from "lucide-react"
import styles from "./Messages.module.css"

const Messages = () => {
  const { user } = useSelector((state) => state.auth)

  const [conversations, setConversations] = useState([
    {
      id: 1,
      name: "Catalina Hotel",
      lastMessage: "Your room has been upgraded to Ocean View.",
      timestamp: "2023-05-10T14:30:00",
      unread: true,
    },
    {
      id: 2,
      name: "Hotel Croydon",
      lastMessage: "Thank you for your reservation. We look forward to your stay.",
      timestamp: "2023-05-08T09:15:00",
      unread: false,
    },
    {
      id: 3,
      name: "Support Team",
      lastMessage: "Is there anything else you need help with?",
      timestamp: "2023-05-05T16:45:00",
      unread: false,
    },
  ])

  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Load messages for selected conversation
  useEffect(() => {
    if (selectedConversation) {
      // Mock messages data
      const mockMessages = [
        {
          id: 1,
          senderId: "hotel",
          text: "Hello! How can we assist you today?",
          timestamp: "2023-05-10T14:25:00",
        },
        {
          id: 2,
          senderId: "user",
          text: "I have a question about my upcoming reservation.",
          timestamp: "2023-05-10T14:26:00",
        },
        {
          id: 3,
          senderId: "hotel",
          text: "Of course! We'd be happy to help. What would you like to know?",
          timestamp: "2023-05-10T14:27:00",
        },
        {
          id: 4,
          senderId: "user",
          text: "Is it possible to request a late check-out?",
          timestamp: "2023-05-10T14:28:00",
        },
        {
          id: 5,
          senderId: "hotel",
          text: "Yes, we can arrange that for you. As a valued guest, we've also upgraded your room to Ocean View at no extra charge.",
          timestamp: "2023-05-10T14:30:00",
        },
      ]

      setMessages(mockMessages)

      // Mark conversation as read
      setConversations(
        conversations.map((conv) => (conv.id === selectedConversation.id ? { ...conv, unread: false } : conv)),
      )
    }
  }, [selectedConversation])

  const handleSendMessage = (e) => {
    e.preventDefault()

    if (!newMessage.trim() || !selectedConversation) return

    const newMsg = {
      id: messages.length + 1,
      senderId: "user",
      text: newMessage,
      timestamp: new Date().toISOString(),
    }

    setMessages([...messages, newMsg])
    setNewMessage("")
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className={styles.messagesPage}>
      <div className={styles.conversationsList}>
        <div className={styles.searchContainer}>
          <div className={styles.searchInputContainer}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search conversations"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        <div className={styles.conversations}>
          {filteredConversations.length === 0 ? (
            <div className={styles.noConversations}>
              <p>No conversations found</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`${styles.conversationItem} ${selectedConversation?.id === conversation.id ? styles.activeConversation : ""}`}
                onClick={() => setSelectedConversation(conversation)}
              >
                <div className={styles.conversationAvatar}>{conversation.name.charAt(0)}</div>
                <div className={styles.conversationInfo}>
                  <div className={styles.conversationHeader}>
                    <h3 className={styles.conversationName}>{conversation.name}</h3>
                    <span className={styles.conversationTime}>{formatDate(conversation.timestamp)}</span>
                  </div>
                  <p className={styles.conversationPreview}>{conversation.lastMessage}</p>
                </div>
                {conversation.unread && <div className={styles.unreadBadge}></div>}
              </div>
            ))
          )}
        </div>
      </div>

      <div className={styles.chatContainer}>
        {selectedConversation ? (
          <>
            <div className={styles.chatHeader}>
              <div className={styles.chatHeaderInfo}>
                <h2 className={styles.chatName}>{selectedConversation.name}</h2>
              </div>
            </div>

            <div className={styles.messagesContainer}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`${styles.messageItem} ${message.senderId === "user" ? styles.userMessage : styles.hotelMessage}`}
                >
                  {message.senderId !== "user" && (
                    <div className={styles.messageAvatar}>{selectedConversation.name.charAt(0)}</div>
                  )}
                  <div className={styles.messageContent}>
                    <div className={styles.messageText}>{message.text}</div>
                    <div className={styles.messageTime}>{formatTime(message.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>

            <form className={styles.messageForm} onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className={styles.messageInput}
              />
              <button type="submit" className={styles.sendButton}>
                <Send size={20} />
              </button>
            </form>
          </>
        ) : (
          <div className={styles.emptyChatContainer}>
            <div className={styles.emptyChatIcon}>
              <User size={48} />
            </div>
            <h2 className={styles.emptyChatTitle}>Your Messages</h2>
            <p className={styles.emptyChatText}>Select a conversation to view messages</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Messages
