import bcrypt from 'bcryptjs';
import prisma from '../db';
import { evaluateAttempt } from '../services/evaluation.service';

async function main() {
  console.log('🌱 Starting database seed into Neon PostgreSQL...');

  // Clean existing tables in reverse dependency order
  await prisma.attemptAnswer.deleteMany({});
  await prisma.quizAttempt.deleteMany({});
  await prisma.questionOption.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.quiz.deleteMany({});
  await prisma.passwordResetToken.deleteMany({});
  await prisma.user.deleteMany({});

  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create Teacher
  const teacher = await prisma.user.create({
    data: {
      name: 'Dr. Eleanor Vance',
      email: 'teacher@quizpulse.com',
      password: defaultPasswordHash,
      role: 'TEACHER',
    },
  });
  console.log(`✅ Teacher created: ${teacher.email}`);

  // 2. Create Students
  const student1 = await prisma.user.create({
    data: {
      name: 'Alex Chen',
      email: 'student1@quizpulse.com',
      password: defaultPasswordHash,
      role: 'STUDENT',
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: 'Sarah Miller',
      email: 'student2@quizpulse.com',
      password: defaultPasswordHash,
      role: 'STUDENT',
    },
  });

  const student3 = await prisma.user.create({
    data: {
      name: 'David Kumar',
      email: 'student3@quizpulse.com',
      password: defaultPasswordHash,
      role: 'STUDENT',
    },
  });
  console.log('✅ 3 Demo students created');

  // 3. Create Quiz 1: Modern Full-Stack Web Architecture (PUBLISHED)
  const quiz1 = await prisma.quiz.create({
    data: {
      title: 'Modern Full-Stack Web Architecture',
      description: 'Test your understanding of REST APIs, HTTP semantics, database concurrency, and React 18 patterns.',
      topic: 'Computer Science',
      durationMinutes: 15,
      passingScore: 70,
      status: 'PUBLISHED',
      teacherId: teacher.id,
      questions: {
        create: [
          {
            type: 'MCQ',
            text: 'Which HTTP status code signifies that a client must authenticate itself to get the requested response?',
            marks: 2,
            orderIndex: 0,
            explanation: 'HTTP 401 Unauthorized indicates that the request requires client authentication credentials.',
            options: {
              create: [
                { text: '200 OK', isCorrect: false, orderIndex: 0 },
                { text: '401 Unauthorized', isCorrect: true, orderIndex: 1 },
                { text: '403 Forbidden', isCorrect: false, orderIndex: 2 },
                { text: '500 Internal Server Error', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            type: 'MCQ',
            text: 'What is the primary architectural purpose of a database connection pooler in serverless environments?',
            marks: 2,
            orderIndex: 1,
            explanation: 'Connection poolers maintain a cache of database connections and multiplex transient serverless function connections.',
            options: {
              create: [
                { text: 'Multiplex concurrent serverless client connections into reusable DB sessions', isCorrect: true, orderIndex: 0 },
                { text: 'Automatically compile SQL queries into binary format', isCorrect: false, orderIndex: 1 },
                { text: 'Encrypt disk storage volumes at the filesystem layer', isCorrect: false, orderIndex: 2 },
                { text: 'Replace indexing strategies in relational tables', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            type: 'MCQ',
            text: 'In React 18, which hook allows you to defer updating a non-urgent part of the user interface?',
            marks: 2,
            orderIndex: 2,
            explanation: 'useDeferredValue defers re-rendering non-critical UI updates until higher-priority user events are handled.',
            options: {
              create: [
                { text: 'useEffect', isCorrect: false, orderIndex: 0 },
                { text: 'useDeferredValue', isCorrect: true, orderIndex: 1 },
                { text: 'useImperativeHandle', isCorrect: false, orderIndex: 2 },
                { text: 'useLayoutEffect', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            type: 'MCQ',
            text: 'Which database transaction isolation level guarantees complete serial execution semantics?',
            marks: 2,
            orderIndex: 3,
            explanation: 'Serializable isolation is the strictest standard SQL level, preventing phantom and non-repeatable reads.',
            options: {
              create: [
                { text: 'Read Uncommitted', isCorrect: false, orderIndex: 0 },
                { text: 'Read Committed', isCorrect: false, orderIndex: 1 },
                { text: 'Repeatable Read', isCorrect: false, orderIndex: 2 },
                { text: 'Serializable', isCorrect: true, orderIndex: 3 },
              ],
            },
          },
          {
            type: 'SHORT_ANSWER',
            text: 'What compact, URL-safe token format contains three base64url-encoded parts separated by dots: Header, Payload, and Signature?',
            marks: 2,
            orderIndex: 4,
            expectedAnswer: 'JWT;JSON Web Token;jwt',
            explanation: 'JSON Web Token (JWT) is the open standard RFC 7519 for securely transmitting claims between parties.',
          },
          {
            type: 'MCQ',
            text: 'Which HTTP method is defined by RFC 7231 as both idempotent and safe for read-only resource retrieval?',
            marks: 2,
            orderIndex: 5,
            explanation: 'GET is safe (causes no server mutations) and idempotent (multiple identical calls produce the same result).',
            options: {
              create: [
                { text: 'POST', isCorrect: false, orderIndex: 0 },
                { text: 'DELETE', isCorrect: false, orderIndex: 1 },
                { text: 'GET', isCorrect: true, orderIndex: 2 },
                { text: 'PATCH', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
        ],
      },
    },
    include: {
      questions: {
        include: { options: true },
      },
    },
  });
  console.log(`✅ Created Quiz 1: ${quiz1.title} (6 questions, 12 total marks)`);

  // 4. Create Quiz 2: Python & Algorithmic Problem Solving (PUBLISHED)
  const quiz2 = await prisma.quiz.create({
    data: {
      title: 'Python & Algorithmic Problem Solving',
      description: 'Evaluate core Python runtime features, algorithmic complexity (Big-O), and foundational data structures.',
      topic: 'Computer Science',
      durationMinutes: 20,
      passingScore: 60,
      status: 'PUBLISHED',
      teacherId: teacher.id,
      questions: {
        create: [
          {
            type: 'MCQ',
            text: 'What is the average time complexity of searching for an element in a Python hash dictionary (dict)?',
            marks: 2,
            orderIndex: 0,
            explanation: 'Python dict lookups use hash table indexing, yielding O(1) average time complexity.',
            options: {
              create: [
                { text: 'O(1)', isCorrect: true, orderIndex: 0 },
                { text: 'O(log n)', isCorrect: false, orderIndex: 1 },
                { text: 'O(n)', isCorrect: false, orderIndex: 2 },
                { text: 'O(n log n)', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            type: 'MCQ',
            text: 'Which Python keyword is used inside a function to yield values one at a time as a generator?',
            marks: 2,
            orderIndex: 1,
            explanation: 'The yield keyword turns a regular function into a generator iterator.',
            options: {
              create: [
                { text: 'return', isCorrect: false, orderIndex: 0 },
                { text: 'yield', isCorrect: true, orderIndex: 1 },
                { text: 'emit', isCorrect: false, orderIndex: 2 },
                { text: 'defer', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            type: 'SHORT_ANSWER',
            text: 'In asymptotic algorithm analysis, what notation represents the tight asymptotic bound (both upper and lower)?',
            marks: 2,
            orderIndex: 2,
            expectedAnswer: 'Big-Theta;Theta;Theta notation;Big Theta;theta',
            explanation: 'Big-Theta (Θ) defines a tight bound, sandwiching the running time from both above and below.',
          },
          {
            type: 'MCQ',
            text: 'Which built-in Python data structure is immutable once instantiated?',
            marks: 2,
            orderIndex: 3,
            explanation: 'Tuples are immutable sequences in Python.',
            options: {
              create: [
                { text: 'list', isCorrect: false, orderIndex: 0 },
                { text: 'set', isCorrect: false, orderIndex: 1 },
                { text: 'tuple', isCorrect: true, orderIndex: 2 },
                { text: 'dict', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            type: 'MCQ',
            text: 'What is the worst-case time complexity of QuickSort when a poorly chosen pivot is used on a sorted list?',
            marks: 2,
            orderIndex: 4,
            explanation: 'Without random pivoting or median-of-three, QuickSort degrades to O(n²) on already sorted inputs.',
            options: {
              create: [
                { text: 'O(n)', isCorrect: false, orderIndex: 0 },
                { text: 'O(n log n)', isCorrect: false, orderIndex: 1 },
                { text: 'O(n²)', isCorrect: true, orderIndex: 2 },
                { text: 'O(2ⁿ)', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
        ],
      },
    },
    include: {
      questions: {
        include: { options: true },
      },
    },
  });
  console.log(`✅ Created Quiz 2: ${quiz2.title}`);

  // 5. Create Quiz 3: General Science & Astronomy Trivia (PUBLISHED)
  const quiz3 = await prisma.quiz.create({
    data: {
      title: 'General Science & Astronomy Trivia',
      description: 'Explore the mysteries of the solar system, fundamental physics, and chemistry concepts.',
      topic: 'Science',
      durationMinutes: 10,
      passingScore: 50,
      status: 'PUBLISHED',
      teacherId: teacher.id,
      questions: {
        create: [
          {
            type: 'MCQ',
            text: 'Which planet in our solar system has the most prominent and extensive planetary ring system?',
            marks: 2,
            orderIndex: 0,
            explanation: 'Saturn is world-renowned for its majestic, extensive ring system composed mostly of water ice particles.',
            options: {
              create: [
                { text: 'Jupiter', isCorrect: false, orderIndex: 0 },
                { text: 'Saturn', isCorrect: true, orderIndex: 1 },
                { text: 'Uranus', isCorrect: false, orderIndex: 2 },
                { text: 'Neptune', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            type: 'MCQ',
            text: 'What subatomic particle carries a negative fundamental electrical charge?',
            marks: 2,
            orderIndex: 1,
            explanation: 'Electrons have a negative charge of -1e.',
            options: {
              create: [
                { text: 'Proton', isCorrect: false, orderIndex: 0 },
                { text: 'Neutron', isCorrect: false, orderIndex: 1 },
                { text: 'Electron', isCorrect: true, orderIndex: 2 },
                { text: 'Positron', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            type: 'MCQ',
            text: 'What is the chemical symbol for gold in the periodic table of elements?',
            marks: 2,
            orderIndex: 2,
            explanation: 'Au comes from the Latin name for gold, Aurum.',
            options: {
              create: [
                { text: 'Ag', isCorrect: false, orderIndex: 0 },
                { text: 'Au', isCorrect: true, orderIndex: 1 },
                { text: 'Fe', isCorrect: false, orderIndex: 2 },
                { text: 'Pb', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            type: 'MCQ',
            text: 'What celestial phenomenon occurs when the Moon passes directly between the Earth and the Sun?',
            marks: 2,
            orderIndex: 3,
            explanation: 'A solar eclipse occurs when the Moon blocks sunlight from reaching Earth.',
            options: {
              create: [
                { text: 'Lunar Eclipse', isCorrect: false, orderIndex: 0 },
                { text: 'Solar Eclipse', isCorrect: true, orderIndex: 1 },
                { text: 'Equinox', isCorrect: false, orderIndex: 2 },
                { text: 'Solstice', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            type: 'MCQ',
            text: 'What is the approximate speed of light in vacuum in kilometers per second?',
            marks: 2,
            orderIndex: 4,
            explanation: 'The speed of light in a vacuum is approximately 299,792 km/s (roughly 300,000 km/s).',
            options: {
              create: [
                { text: '150,000 km/s', isCorrect: false, orderIndex: 0 },
                { text: '300,000 km/s', isCorrect: true, orderIndex: 1 },
                { text: '450,000 km/s', isCorrect: false, orderIndex: 2 },
                { text: '1,080,000 km/s', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
        ],
      },
    },
    include: {
      questions: {
        include: { options: true },
      },
    },
  });
  console.log(`✅ Created Quiz 3: ${quiz3.title}`);

  // 6. Create Quiz 4: Cloud Native Microservices (DRAFT - for Teacher edit/publish testing)
  const quiz4 = await prisma.quiz.create({
    data: {
      title: 'Cloud Native Microservices & Docker',
      description: 'Container orchestration, Kubernetes pods, and distributed tracing essentials.',
      topic: 'DevOps',
      durationMinutes: 15,
      passingScore: 65,
      status: 'DRAFT',
      teacherId: teacher.id,
      questions: {
        create: [
          {
            type: 'MCQ',
            text: 'What is the smallest deployable computing unit in Kubernetes?',
            marks: 2,
            orderIndex: 0,
            explanation: 'A Pod is the smallest execution unit in Kubernetes.',
            options: {
              create: [
                { text: 'Container', isCorrect: false, orderIndex: 0 },
                { text: 'Pod', isCorrect: true, orderIndex: 1 },
                { text: 'Deployment', isCorrect: false, orderIndex: 2 },
                { text: 'Node', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            type: 'SHORT_ANSWER',
            text: 'What open-source containerization platform uses Dockerfiles to build container images?',
            marks: 3,
            orderIndex: 1,
            expectedAnswer: 'Docker;docker',
            explanation: 'Docker is the leading containerization engine.',
          },
        ],
      },
    },
  });
  console.log(`✅ Created Quiz 4: ${quiz4.title} (DRAFT status for teacher workflow demo)`);

  // 7. Seed Realistic Student Attempts and Results
  console.log('📊 Seeding realistic attempts and student analytics...');

  // Helper function to simulate and record a student attempt
  async function simulateAttempt(
    studentId: string,
    quizObj: any,
    answersToSubmit: Array<{ questionId: string; selectedOptionId?: string; textAnswer?: string }>,
    minutesAgo: number
  ) {
    const startedAt = new Date(Date.now() - minutesAgo * 60 * 1000);
    const submittedAt = new Date(startedAt.getTime() + 8 * 60 * 1000); // took 8 minutes
    const deadline = new Date(startedAt.getTime() + quizObj.durationMinutes * 60 * 1000);

    const evalResult = evaluateAttempt(quizObj.questions, answersToSubmit, quizObj.passingScore);

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId: quizObj.id,
        studentId,
        status: 'SUBMITTED',
        startedAt,
        deadline,
        submittedAt,
        score: evalResult.score,
        totalMarks: evalResult.totalMarks,
        percentage: evalResult.percentage,
        passed: evalResult.passed,
        correctCount: evalResult.correctCount,
        incorrectCount: evalResult.incorrectCount,
        unansweredCount: evalResult.unansweredCount,
        answers: {
          create: evalResult.evaluatedAnswers.map((ea) => ({
            questionId: ea.questionId,
            selectedOptionId: ea.selectedOptionId,
            textAnswer: ea.textAnswer,
            isCorrect: ea.isCorrect,
            marksAwarded: ea.marksAwarded,
          })),
        },
      },
    });

    return attempt;
  }

  // Alex Chen takes Quiz 1: gets 5/6 right (10/12 marks, 83.3%, PASSED)
  const q1Questions = quiz1.questions;
  await simulateAttempt(
    student1.id,
    quiz1,
    [
      { questionId: q1Questions[0].id, selectedOptionId: q1Questions[0].options.find((o) => o.isCorrect)!.id },
      { questionId: q1Questions[1].id, selectedOptionId: q1Questions[1].options.find((o) => o.isCorrect)!.id },
      { questionId: q1Questions[2].id, selectedOptionId: q1Questions[2].options.find((o) => o.isCorrect)!.id },
      { questionId: q1Questions[3].id, selectedOptionId: q1Questions[3].options.find((o) => !o.isCorrect)!.id }, // wrong
      { questionId: q1Questions[4].id, textAnswer: 'JWT' }, // correct
      { questionId: q1Questions[5].id, selectedOptionId: q1Questions[5].options.find((o) => o.isCorrect)!.id },
    ],
    180
  );

  // Sarah Miller takes Quiz 1: gets 4/6 right (8/12 marks, 66.7%, FAILED threshold 70%)
  await simulateAttempt(
    student2.id,
    quiz1,
    [
      { questionId: q1Questions[0].id, selectedOptionId: q1Questions[0].options.find((o) => o.isCorrect)!.id },
      { questionId: q1Questions[1].id, selectedOptionId: q1Questions[1].options.find((o) => !o.isCorrect)!.id }, // wrong
      { questionId: q1Questions[2].id, selectedOptionId: q1Questions[2].options.find((o) => o.isCorrect)!.id },
      { questionId: q1Questions[3].id, selectedOptionId: q1Questions[3].options.find((o) => !o.isCorrect)!.id }, // wrong
      { questionId: q1Questions[4].id, textAnswer: 'jwt' }, // correct
      { questionId: q1Questions[5].id, selectedOptionId: q1Questions[5].options.find((o) => o.isCorrect)!.id },
    ],
    120
  );

  // David Kumar takes Quiz 1: gets 6/6 right (12/12 marks, 100%, PASSED)
  await simulateAttempt(
    student3.id,
    quiz1,
    [
      { questionId: q1Questions[0].id, selectedOptionId: q1Questions[0].options.find((o) => o.isCorrect)!.id },
      { questionId: q1Questions[1].id, selectedOptionId: q1Questions[1].options.find((o) => o.isCorrect)!.id },
      { questionId: q1Questions[2].id, selectedOptionId: q1Questions[2].options.find((o) => o.isCorrect)!.id },
      { questionId: q1Questions[3].id, selectedOptionId: q1Questions[3].options.find((o) => o.isCorrect)!.id },
      { questionId: q1Questions[4].id, textAnswer: 'JSON Web Token' }, // correct
      { questionId: q1Questions[5].id, selectedOptionId: q1Questions[5].options.find((o) => o.isCorrect)!.id },
    ],
    90
  );

  // Sarah Miller takes Quiz 2: gets 5/5 right (10/10 marks, 100%, PASSED)
  const q2Questions = quiz2.questions;
  await simulateAttempt(
    student2.id,
    quiz2,
    [
      { questionId: q2Questions[0].id, selectedOptionId: q2Questions[0].options.find((o) => o.isCorrect)!.id },
      { questionId: q2Questions[1].id, selectedOptionId: q2Questions[1].options.find((o) => o.isCorrect)!.id },
      { questionId: q2Questions[2].id, textAnswer: 'Theta' }, // correct
      { questionId: q2Questions[3].id, selectedOptionId: q2Questions[3].options.find((o) => o.isCorrect)!.id },
      { questionId: q2Questions[4].id, selectedOptionId: q2Questions[4].options.find((o) => o.isCorrect)!.id },
    ],
    60
  );

  // Alex Chen takes Quiz 2: gets 4/5 right (8/10 marks, 80%, PASSED)
  await simulateAttempt(
    student1.id,
    quiz2,
    [
      { questionId: q2Questions[0].id, selectedOptionId: q2Questions[0].options.find((o) => o.isCorrect)!.id },
      { questionId: q2Questions[1].id, selectedOptionId: q2Questions[1].options.find((o) => o.isCorrect)!.id },
      { questionId: q2Questions[2].id, textAnswer: 'Big-O' }, // wrong (asked for tight bound)
      { questionId: q2Questions[3].id, selectedOptionId: q2Questions[3].options.find((o) => o.isCorrect)!.id },
      { questionId: q2Questions[4].id, selectedOptionId: q2Questions[4].options.find((o) => o.isCorrect)!.id },
    ],
    45
  );

  // Alex Chen takes Quiz 3: gets 5/5 right (10/10 marks, 100%, PASSED)
  const q3Questions = quiz3.questions;
  await simulateAttempt(
    student1.id,
    quiz3,
    [
      { questionId: q3Questions[0].id, selectedOptionId: q3Questions[0].options.find((o) => o.isCorrect)!.id },
      { questionId: q3Questions[1].id, selectedOptionId: q3Questions[1].options.find((o) => o.isCorrect)!.id },
      { questionId: q3Questions[2].id, selectedOptionId: q3Questions[2].options.find((o) => o.isCorrect)!.id },
      { questionId: q3Questions[3].id, selectedOptionId: q3Questions[3].options.find((o) => o.isCorrect)!.id },
      { questionId: q3Questions[4].id, selectedOptionId: q3Questions[4].options.find((o) => o.isCorrect)!.id },
    ],
    30
  );

  // David Kumar takes Quiz 3: gets 3/5 right (6/10 marks, 60%, PASSED threshold 50%)
  await simulateAttempt(
    student3.id,
    quiz3,
    [
      { questionId: q3Questions[0].id, selectedOptionId: q3Questions[0].options.find((o) => o.isCorrect)!.id },
      { questionId: q3Questions[1].id, selectedOptionId: q3Questions[1].options.find((o) => !o.isCorrect)!.id }, // wrong
      { questionId: q3Questions[2].id, selectedOptionId: q3Questions[2].options.find((o) => o.isCorrect)!.id },
      { questionId: q3Questions[3].id, selectedOptionId: q3Questions[3].options.find((o) => !o.isCorrect)!.id }, // wrong
      { questionId: q3Questions[4].id, selectedOptionId: q3Questions[4].options.find((o) => o.isCorrect)!.id },
    ],
    15
  );

  console.log('🎉 Seeding successfully completed into Neon PostgreSQL!');
  console.log(`
==================================================
🔑 DEMO ACCOUNTS (PASSWORD: Password123!):
--------------------------------------------------
Teacher:  teacher@quizpulse.com   (Dr. Eleanor Vance)
Student1: student1@quizpulse.com  (Alex Chen)
Student2: student2@quizpulse.com  (Sarah Miller)
Student3: student3@quizpulse.com  (David Kumar)
==================================================
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
