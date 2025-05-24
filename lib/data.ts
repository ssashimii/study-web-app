// lib/data.ts

export interface Course {
  id: number
  title: string
  description: string
  color: string
}

export interface Buddy {
  id: number
  name: string
  courseIds: number[]
  avatarUrl?: string | null
}

export interface Availability {
  date: string
  time: string
  topic: string
}

export interface Profile {
  name: string
  year: string
  avatarUrl: string | null
  courses: string[]
  studyPreference?: string
  availability: Availability[]
}

// Local in-memory availability store
let currentAvailability: Availability[] = [
  { date: '2025-05-23', time: '10:00–12:00', topic: 'Math' },
  { date: '2025-05-24', time: '14:00–16:00', topic: 'Physics' }
]

export function setAvailability(newAvailability: Availability[]) {
  currentAvailability = newAvailability
}

export function getAvailability(): Availability[] {
  return currentAvailability
}

// Profile of the current user
export async function getProfile(): Promise<Profile> {
  return {
    name: 'Mia Petrusic',
    year: '2nd year',
    avatarUrl: null,
    courses: ['Math', 'Literature', 'Music'],
    studyPreference: 'Library',
    availability: getAvailability()
  }
}

// List of sample courses
export async function getCourses(): Promise<Course[]> {
  return [
    { id: 1, title: 'Math', description: 'Learn algebra and calculus.', color: '#FFD54F' },
    { id: 2, title: 'Physics', description: 'Explore the laws of motion.', color: '#81D4FA' },
    { id: 3, title: 'Literature', description: 'Dive into classic novels.', color: '#CE93D8' },
    { id: 4, title: 'Music', description: 'Study theory and instruments.', color: '#A5D6A7' },
    { id: 5, title: 'Biology', description: 'Understand living organisms.', color: '#FFAB91' },
    { id: 6, title: 'Computer Science', description: 'Code and algorithms.', color: '#90CAF9' },
    { id: 7, title: 'Art History', description: 'From cave paintings to pop art.', color: '#FFCC80' }
  ]
}

// Sample buddies and their enrolled course IDs
export async function getBuddies(): Promise<Buddy[]> {
  return [
    {
      id: 1,
      name: 'Jane Doe',
      courseIds: [1, 3],
      avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      id: 2,
      name: 'Mike Smith',
      courseIds: [4, 6],
      avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: 3,
      name: 'Eva Green',
      courseIds: [1, 4, 7],
      avatarUrl: 'https://randomuser.me/api/portraits/women/12.jpg'
    },
    {
      id: 4,
      name: 'Tom Clark',
      courseIds: [2, 5],
      avatarUrl: 'https://randomuser.me/api/portraits/men/14.jpg'
    },
    {
      id: 5,
      name: 'Nina Taylor',
      courseIds: [3, 6],
      avatarUrl: 'https://randomuser.me/api/portraits/women/21.jpg'
    },
    {
      id: 6,
      name: 'Alex Brown',
      courseIds: [2, 7],
      avatarUrl: 'https://randomuser.me/api/portraits/men/36.jpg'
    },
    {
      id: 7,
      name: 'Sara Lee',
      courseIds: [5, 6],
      avatarUrl: 'https://randomuser.me/api/portraits/women/25.jpg'
    },
    {
      id: 8,
      name: 'Lena Ivanova',
      courseIds: [1, 2],
      avatarUrl: 'https://randomuser.me/api/portraits/women/28.jpg'
    },
    {
      id: 9,
      name: 'Chris Wang',
      courseIds: [3, 7],
      avatarUrl: 'https://randomuser.me/api/portraits/men/11.jpg'
    },
    {
      id: 10,
      name: 'Isabella Rossi',
      courseIds: [2, 6],
      avatarUrl: 'https://randomuser.me/api/portraits/women/33.jpg'
    }
  ]
}
