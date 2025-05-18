import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.availability.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  const users = await Promise.all([
    prisma.user.create({ data: { firstName: 'Anfisa', lastName: 'Bormotina', email: 'anfisa@example.com', password: 'anfisa123', academic: 2, interests: 'math, science', studyEnv: 'hybrid' }}),
    prisma.user.create({ data: { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', password: 'jane123', academic: 1, interests: 'literature, music', studyEnv: 'online' }}),
    prisma.user.create({ data: { firstName: 'Mike', lastName: 'Smith', email: 'mike@example.com', password: 'mike123', academic: 3, interests: 'technology, art', studyEnv: 'on-campus' }}),
    prisma.user.create({ data: { firstName: 'Lena', lastName: 'Ivanova', email: 'lena@example.com', password: 'lena123', academic: 2, interests: 'languages, history', studyEnv: 'online' }}),
    prisma.user.create({ data: { firstName: 'John', lastName: 'Miller', email: 'john@example.com', password: 'john123', academic: 3, interests: 'science, technology', studyEnv: 'on-campus' }}),
    prisma.user.create({ data: { firstName: 'Eva', lastName: 'Green', email: 'eva@example.com', password: 'eva123', academic: 1, interests: 'art, music', studyEnv: 'hybrid' }}),
    prisma.user.create({ data: { firstName: 'Tom', lastName: 'Clark', email: 'tom@example.com', password: 'tom123', academic: 3, interests: 'math, technology', studyEnv: 'on-campus' }}),
    prisma.user.create({ data: { firstName: 'Nina', lastName: 'Taylor', email: 'nina@example.com', password: 'nina123', academic: 2, interests: 'languages, literature', studyEnv: 'online' }}),
    prisma.user.create({ data: { firstName: 'Alex', lastName: 'Brown', email: 'alex@example.com', password: 'alex123', academic: 2, interests: 'science, history', studyEnv: 'hybrid' }}),
    prisma.user.create({ data: { firstName: 'Sara', lastName: 'Lee', email: 'sara@example.com', password: 'sara123', academic: 1, interests: 'biology, languages', studyEnv: 'on-campus' }}),
  ]);

  await prisma.availability.createMany({
    data: [
      { day: 'Monday', from: '09:00', to: '11:00', userId: users[0].id },
      { day: 'Wednesday', from: '14:00', to: '16:00', userId: users[0].id },
      { day: 'Monday', from: '09:30', to: '11:30', userId: users[1].id },
      { day: 'Thursday', from: '10:00', to: '12:00', userId: users[1].id },
      { day: 'Friday', from: '13:00', to: '15:00', userId: users[2].id },
      { day: 'Wednesday', from: '14:30', to: '16:30', userId: users[2].id },
      { day: 'Tuesday', from: '08:00', to: '10:00', userId: users[3].id },
      { day: 'Thursday', from: '09:00', to: '11:00', userId: users[3].id },
      { day: 'Wednesday', from: '14:00', to: '16:00', userId: users[4].id },
      { day: 'Friday', from: '13:30', to: '15:30', userId: users[4].id },
      { day: 'Monday', from: '10:00', to: '12:00', userId: users[5].id },
      { day: 'Wednesday', from: '09:00', to: '11:00', userId: users[6].id },
      { day: 'Tuesday', from: '14:00', to: '16:00', userId: users[7].id },
      { day: 'Thursday', from: '08:00', to: '10:00', userId: users[8].id },
      { day: 'Friday', from: '10:00', to: '12:00', userId: users[9].id },
    ]
  });

  await prisma.course.createMany({
    data: [
      { name: 'Math', userId: users[0].id },
      { name: 'Physics', userId: users[0].id },
      { name: 'Literature', userId: users[1].id },
      { name: 'Music', userId: users[1].id },
      { name: 'Technology', userId: users[2].id },
      { name: 'Art', userId: users[2].id },
      { name: 'Languages', userId: users[3].id },
      { name: 'History', userId: users[3].id },
      { name: 'Science', userId: users[4].id },
      { name: 'Technology', userId: users[4].id },
      { name: 'Art', userId: users[5].id },
      { name: 'Math', userId: users[6].id },
      { name: 'Languages', userId: users[7].id },
      { name: 'History', userId: users[8].id },
      { name: 'Biology', userId: users[9].id },
    ],
  });

  console.log('Seeded 10 users, availability, and courses!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());