// pages/api/auth/register.js
import { User } from '../../../lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'your-secret-key'; // Use env variable in production

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { name, email, password, academicYear, courses, studyPrefs } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await User.create({
      name, email, password: hashedPassword, academicYear, courses, studyPrefs,
    });
    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}