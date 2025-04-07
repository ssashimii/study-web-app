// pages/index.js
import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, ListGroup } from 'react-bootstrap';

export default function Home() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [matches, setMatches] = useState([]);
  const [messages, setMessages] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [courses, setCourses] = useState('');
  const [studyPrefs, setStudyPrefs] = useState({ availability: {}, groupSize: '', studyStyle: '' });
  const [messageContent, setMessageContent] = useState('');
  const [selectedMatch, setSelectedMatch] = useState(null);

  const apiFetch = async (url, options = {}) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  };

  const login = async (e) => {
    e.preventDefault();
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' },
    });
    setToken(data.token);
    const profile = await apiFetch('/api/profile');
    setUser(profile);
  };

  const register = async (e) => {
    e.preventDefault();
    const data = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name, email, password, academicYear, courses: courses.split(','), studyPrefs,
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    setToken(data.token);
    const profile = await apiFetch('/api/profile');
    setUser(profile);
  };

  const fetchMatches = async () => {
    const data = await apiFetch('/api/matches');
    setMatches(data);
  };

  const sendMessage = async (receiverId) => {
    await apiFetch('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ receiverId, content: messageContent }),
      headers: { 'Content-Type': 'application/json' },
    });
    setMessageContent('');
    fetchMessages(receiverId);
  };

  const fetchMessages = async (receiverId) => {
    const data = await apiFetch(`/api/messages?receiverId=${receiverId}`);
    setMessages(data);
    setSelectedMatch(receiverId);
  };

  useEffect(() => {
    if (token) fetchMatches();
  }, [token]);

  return (
    <Container className="mt-4">
      {!token ? (
        <Row>
          <Col md={6}>
            <h2>Login</h2>
            <Form onSubmit={login}>
              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control value={email} onChange={(e) => setEmail(e.target.value)} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </Form.Group>
              <Button type="submit" className="mt-2">Login</Button>
            </Form>
          </Col>
          <Col md={6}>
            <h2>Register</h2>
            <Form onSubmit={register}>
              <Form.Group>
                <Form.Label>Name</Form.Label>
                <Form.Control value={name} onChange={(e) => setName(e.target.value)} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control value={email} onChange={(e) => setEmail(e.target.value)} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Academic Year</Form.Label>
                <Form.Control value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Courses (comma-separated)</Form.Label>
                <Form.Control value={courses} onChange={(e) => setCourses(e.target.value)} />
              </Form.Group>
              <Button type="submit" className="mt-2">Register</Button>
            </Form>
          </Col>
        </Row>
      ) : (
        <Row>
          <Col md={4}>
            <h2>Your Profile</h2>
            <Card>
              <Card.Body>
                <Card.Title>{user?.name}</Card.Title>
                <Card.Text>Year: {user?.academicYear}</Card.Text>
                <Card.Text>Courses: {user?.courses.join(', ')}</Card.Text>
              </Card.Body>
            </Card>
            <h2 className="mt-4">Matches</h2>
            <ListGroup>
              {matches.map((match) => (
                <ListGroup.Item key={match.id} action onClick={() => fetchMessages(match.id)}>
                  {match.name} - {match.courses.join(', ')}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Col>
          <Col md={8}>
            {selectedMatch && (
              <>
                <h2>Messages</h2>
                <ListGroup>
                  {messages.map((msg) => (
                    <ListGroup.Item key={msg.id}>
                      {msg.senderId === user.id ? 'You' : 'They'}: {msg.content}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                <Form className="mt-3" onSubmit={(e) => { e.preventDefault(); sendMessage(selectedMatch); }}>
                  <Form.Group>
                    <Form.Control
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      placeholder="Type a message"
                    />
                  </Form.Group>
                  <Button type="submit" className="mt-2">Send</Button>
                </Form>
              </>
            )}
          </Col>
        </Row>
      )}
    </Container>
  );
}