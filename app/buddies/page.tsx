'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './buddies.module.css';
import { FiMessageSquare, FiX, FiUser, FiSearch, FiPlus, FiTrash2 } from 'react-icons/fi';
import Link from 'next/link';

interface Availability {
  date: string;
  time: string;
  topic: string;
}

interface Buddy {
  id: number;
  name: string;
  avatarUrl: string;
  courses: string[];
  studyPreference: string;
  availability: Availability[];
  lastActive?: string;
}

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  text: string;
  createdAt: string;
}

interface ProfileData {
  id: number;
  firstName: string;
  lastName: string;
  avatar?: string;
  academic: string;
  courses: Array<{
    name: string;
    description?: string;
  }>;
  availability: Array<{
    day: string;
    from: string;
    to: string;
    topic?: string;
  }>;
  interests: string;
  studyEnv: string;
}

export default function BuddiesPage() {
  const [selectedProfile, setSelectedProfile] = useState<ProfileData | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [buddies, setBuddies] = useState<Buddy[]>([]);
  const [searchResults, setSearchResults] = useState<Buddy[]>([]);
  const [openChatWith, setOpenChatWith] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatBodyRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<Buddy[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [buddiesRes, usersRes] = await Promise.all([
          fetch('/api/buddies'),
          fetch('/api/users')
        ]);

        if (!buddiesRes.ok || !usersRes.ok) throw new Error('Error while loading');

        const buddiesData = await buddiesRes.json();
        const usersData = await usersRes.json();

        setBuddies(buddiesData);
        setAllUsers(usersData);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
  const timer = setTimeout(() => {
    if (searchTerm.trim()) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, 100); 

  return () => clearTimeout(timer);
}, [searchTerm]);

const handleSearch = async () => {
  const term = searchTerm.trim();
  if (!term) {
    setSearchResults([]);
    return;
  }

  setSearchLoading(true);
  try {
    const res = await fetch(`/api/search-users?q=${encodeURIComponent(term)}`);
    if (!res.ok) throw new Error('Search error');
    const users = await res.json();
    setSearchResults(users);
  } catch (err) {
    setSearchResults([]);
    console.error('Search error:', err);
  } finally {
    setSearchLoading(false);
  }
};

  const openChat = async (buddyId: number) => {
    setOpenChatWith(buddyId);

    try {
      const res = await fetch(`/api/messages?contactId=${buddyId}`);
      if (!res.ok) throw new Error('Messages loading error');
      const messages = await res.json();
      setChatMessages(messages);
    } catch (err) {
      console.error('Messages loading error:', err);
    }
  };

  const handleViewProfile = async (userId: number) => {
    try {
      const res = await fetch(`/api/friend-profile?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      setSelectedProfile(data);
      setShowProfileModal(true);
    } catch (error) {
      console.error('Error fetching friend profile:', error);
    }
  };

  const handleRemoveFriend = async (friendId: number) => {
    try {
      const res = await fetch('/api/remove-friend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Error while deleting buddy');
        return;
      }

      setBuddies(prev => prev.filter(b => b.id !== friendId));
    } catch (err) {
      alert('Error while deleting buddy');
    }
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || openChatWith === null) return;

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: openChatWith, text: chatInput }),
      });

      if (!res.ok) throw new Error('Error while sending a message');

      const newMessage: Message = await res.json();
      setChatMessages(prev => [...prev, newMessage]);
      setChatInput('');
    } catch (err) {
      console.error('Error while sending a message:', err);
    }
  };

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <div className={styles.wrapper}>
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>Study Buddy</h2>
        <Link href="/dashboard" className={styles.navItem}>Dashboard</Link>
        <Link href="/profile" className={styles.navItem}>
          Profile
        </Link>
        <Link href="/buddies" className={`${styles.navItem} ${styles.active}`}>
          Buddies
        </Link>
        <Link href="/messages" className={styles.navItem}>Messages</Link>
        <Link href="/logout" className={styles.navItem}>Logout</Link>
      </aside>

      <main className={styles.main}>
        <section className={styles.section}>
          <h2>My Buddies</h2>
          {loading ? (
            <div className="text-center py-8">Loading buddies...</div>
          ) : error ? (
            <div className="text-red-500">Error: {error}</div>
          ) : buddies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              You haven't added any study buddies yet.
            </div>
          ) : (
            <div className={styles.grid}>
              {buddies.map(buddy => (
                <div key={buddy.id} className={styles.card}>
                  {buddy.avatarUrl ? (
                    <img src={buddy.avatarUrl} alt={buddy.name} className={styles.avatar} />
                  ) : (
                    <div className={styles.avatarLarge}>
                      {buddy.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className={styles.name}>{buddy.name}</div>
                  <div className={styles.actions}>
                    <button 
                      className={`${styles.button} ${styles.buttonSecondary}`}
                      onClick={() => handleViewProfile(buddy.id)}
                    >
                      Profile
                    </button>
                    <button 
                      className={`${styles.button} ${styles.buttonPrimary}`}
                      onClick={() => openChat(buddy.id)}
                    >
                      <FiMessageSquare /> Chat
                    </button>
                    <button
                      className={`${styles.button} ${styles.buttonDanger}`}
                      onClick={() => handleRemoveFriend(buddy.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={styles.section}>
          <h2>Find New Buddies</h2>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search by name or course..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className={styles.searchInput}
            />
            <button onClick={handleSearch} className={styles.searchButton}>
              <FiSearch />
            </button>
          </div>

          {searchResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No results found' : 'Search for study buddies by name or course'}
            </div>
          ) : (
            <div className={styles.grid}>
              {searchResults.map(user => (
                <div key={user.id} className={styles.card}>
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className={styles.avatar} />
                  ) : (
                    <div className={styles.avatarLarge}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className={styles.name}>{user.name}</div>
                  <div className={styles.actions}>
                    <button 
                      className={`${styles.button} ${styles.buttonSecondary}`}
                      onClick={() => handleViewProfile(user.id)}
                    >
                      View
                    </button>
                    <button
                      className={`${styles.button} ${styles.buttonPrimary}`}
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/add-friend', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ friendId: user.id }),
                          });

                          if (res.ok) {
                            const updated = await fetch('/api/buddies');
                            const newList = await updated.json();
                            setBuddies(newList);
                            setSearchResults(prev => prev.filter(u => u.id !== user.id));
                          } else {
                            const data = await res.json();
                            alert(data.error || 'Error while adding buddy');
                          }
                        } catch (err) {
                          alert('Error while adding buddy');
                        }
                      }}
                    >
                      <FiPlus /> Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {openChatWith !== null && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <span className={styles.chatTitle}>
              Chat with {buddies.find(b => b.id === openChatWith)?.name || ''}
            </span>
            <button onClick={() => setOpenChatWith(null)} className={styles.chatClose}>
              <FiX />
            </button>
          </div>

          <div className={styles.chatBody} ref={chatBodyRef}>
            {chatMessages.map(msg => {
              const isMyMessage = msg.senderId !== openChatWith;
              return (
                <div
                  key={msg.id}
                  className={`${styles.messageBubble} ${
                    isMyMessage ? styles.sent : styles.received
                  }`}
                >
                  {msg.text}
                  <div className={styles.timestamp}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.chatInput}>
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}

      {showProfileModal && selectedProfile && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Buddy Profile</h2>
              <button 
                onClick={() => setShowProfileModal(false)} 
                className={styles.modalCloseBtn}
              >
                <FiX />
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.profileHeader}>
                {selectedProfile.avatar ? (
                  <img 
                    src={selectedProfile.avatar} 
                    alt="Profile" 
                    className={styles.avatarLarge} 
                  />
                ) : (
                  <div className={styles.avatarLarge}>
                    {selectedProfile.firstName?.charAt(0)}{selectedProfile.lastName?.charAt(0)}
                  </div>
                )}
                <h3 className={styles.profileName}>
                  {selectedProfile.firstName} {selectedProfile.lastName}
                </h3>
                <div className={styles.profileMeta}>Academic Year {selectedProfile.academic}</div>
              </div>

              <div className={styles.sectionContent}>
                <h4 className={styles.sectionTitle}>Courses</h4>
                {selectedProfile.courses.length > 0 ? (
                  <ul>
                    {selectedProfile.courses.map((course, i) => (
                      <li key={i} className={styles.courseItem}>
                        <div className={styles.courseName}>{course.name}</div>
                        {course.description && (
                          <div className={styles.courseDesc}>{course.description}</div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No courses listed</p>
                )}
              </div>

              <div className={styles.sectionContent}>
                <h4 className={styles.sectionTitle}>Availability</h4>
                {selectedProfile.availability.length > 0 ? (
                  <ul>
                    {selectedProfile.availability.map((slot, i) => (
                      <li key={i} className={styles.availabilityItem}>
                        <strong>{slot.day}</strong>: {slot.from} - {slot.to}
                        {slot.topic && <div>Topic: {slot.topic}</div>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No availability set</p>
                )}
              </div>

              <div className={styles.sectionContent}>
                <h4 className={styles.sectionTitle}>About</h4>
                <p><strong>Interests:</strong> {selectedProfile.interests || 'Not specified'}</p>
                <p><strong>Study Environment:</strong> {selectedProfile.studyEnv || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}