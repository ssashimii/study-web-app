'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './buddies.module.css';
import { FiMessageSquare, FiX } from 'react-icons/fi';
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
}

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  text: string;
  createdAt: string;
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

  const handleSearch = async () => {
    const term = searchTerm.trim();
    if (!term) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await fetch(`/api/search-users?q=${encodeURIComponent(term)}`);
      if (!res.ok) throw new Error('Ошибка поиска');
      const users = await res.json();
      setSearchResults(users);
    } catch (err) {
      setSearchResults([]);
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
  // if (!confirm('Confirm delete')) return;

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

      if (!res.ok) throw new Error('Error while sendinf a message');

      const newMessage: Message = await res.json();
      setChatMessages(prev => [...prev, newMessage]);
      setChatInput('');
    } catch (err) {
      console.error('Error while sendinf a message:', err);
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
        <h2 className={styles.sidebarTitle}>My Dashboard</h2>
        <Link href="/profile" className={styles.navItem}>Profile</Link>
        <Link href="/courses" className={styles.navItem}>Courses</Link>
        <Link href="/buddies" className={`${styles.navItem} ${styles.active}`}>Buddies</Link>
        <Link href="/messages" className={styles.navItem}>Messages</Link>
        <Link href="/settings" className={styles.navItem}>Settings</Link>
        <Link href="/" className={styles.navItem}>Logout</Link>
      </aside>

      <main className={styles.main} style={{ display: 'flex', gap: '20px' }}>
        <section style={{ flex: 1, borderRight: '1px solid #ccc', paddingRight: '20px' }}>
          <h2>My Buddies</h2>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>Error: {error}</p>
          ) : buddies.length === 0 ? (
            <p>No buddies added yet.</p>
          ) : (
            <div className={styles.grid}>
              {buddies.map(buddy => (
                <div key={buddy.id} className={styles.card}>
                  <div className={styles.avatar}>
                    <img src={buddy.avatarUrl} alt={buddy.name} />
                  </div>
                  <div className={styles.name}>{buddy.name}</div>
                  <div className={styles.actions}>
                    <button className={styles.viewBtn} onClick={() => handleViewProfile(buddy.id)}>
                      Profile
                    </button>
                    <button className={styles.messageBtn} onClick={() => openChat(buddy.id)}>
                      <FiMessageSquare />
                    </button>
                     <button
                      className={styles.deleteFriendBtn}
                      onClick={() => handleRemoveFriend(buddy.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section style={{ flex: 1, paddingLeft: '20px' }}>
          <h2>Buddies' Search</h2>
          <div style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Start entering..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className={styles.searchInput}
              style={{ flex: 1 }}
            />
            <button onClick={handleSearch} className={styles.searchButton}>
              Search
            </button>
          </div>

          {searchResults.length === 0 ? (
            <p>Search your Buddies.</p>
          ) : (
            <div className={styles.grid}>
              {searchResults.map(buddy => (
                <div key={buddy.id} className={styles.card}>
                  <div className={styles.avatar}>
                    <img src={buddy.avatarUrl} alt={buddy.name} />
                  </div>
                  <div className={styles.name}>{buddy.name}</div>
                  <div className={styles.actions}>
                    <button className={styles.viewBtn} onClick={() => handleViewProfile(buddy.id)}>
                      Profile
                    </button>
                    <button className={styles.messageBtn} onClick={() => openChat(buddy.id)}>
                      <FiMessageSquare />
                    </button>
                    <button
                      className={styles.addFriendBtn}
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/add-friend', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ friendId: buddy.id }),
                          });

                          if (res.ok) {
                            const updated = await fetch('/api/buddies');
                            const newList = await updated.json();
                            setBuddies(newList);
                            setSearchResults(results => results.filter(u => u.id !== buddy.id));
                          } else {
                            const data = await res.json();
                            alert(data.error || 'Error while adding a buddy');
                          }
                        } catch (err) {
                          alert('Error while adding a buddy');
                        }
                      }}
                    >
                      Add Buddy
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
            <span>
              Chat with {buddies.find(b => b.id === openChatWith)?.name || `ID ${openChatWith}`}
            </span>
            <button onClick={() => setOpenChatWith(null)}>
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
            placeholder="Enter a message..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
        </div>
      )}

      {showProfileModal && selectedProfile && (
  <div className={styles.modalOverlay}>
    <div className={styles.modalContent}>
      <button className={styles.closeBtn} onClick={() => setShowProfileModal(false)}>
        <FiX />
      </button>
      <div className={styles.profileHeader}>
        {selectedProfile.avatar ? (
          <img src={selectedProfile.avatar} alt="Avatar" className={styles.avatarLarge} />
        ) : (
          <div className={styles.avatarLarge}>👤</div>
        )}
        <h2>{selectedProfile.firstName} {selectedProfile.lastName}</h2>
        <p><strong>Academic:</strong> {selectedProfile.academic}</p>
      </div>

      <section className={styles.section}>
        <h3>Courses</h3>
        <ul>
          {selectedProfile.courses.length > 0 ? (
            selectedProfile.courses.map((c, i) => (
              <li key={i}><strong>{c.name}</strong> {c.description ? `— ${c.description}` : ''}</li>
            ))
          ) : (
            <li>No courses listed</li>
          )}
        </ul>
      </section>

      <section className={styles.section}>
        <h3>Availability</h3>
        <ul>
          {selectedProfile.availability.length > 0 ? (
            selectedProfile.availability.map((a, i) => (
              <li key={i}>
                <strong>{a.day}</strong>: {a.from} - {a.to} {a.topic ? `(Topic: ${a.topic})` : ''}
              </li>
            ))
          ) : (
            <li>No availability</li>
          )}
        </ul>
      </section>

      <section className={styles.section}>
        <p><strong>Interests:</strong> {selectedProfile.interests}</p>
        <p><strong>Study Environment:</strong> {selectedProfile.studyEnv}</p>
      </section>
    </div>
  </div>
)}


    </div>
  );
}
