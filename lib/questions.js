/* ============================================================
   TROSC · IT Challenge — Question bank
   ------------------------------------------------------------
   HOW TO EDIT:
   • Add, remove or reorder objects in the array below.
   • The number of levels = the number of questions (currently 20).
   • "correctAnswer" is the INDEX (0, 1, 2 or 3) of the right
     option in the "options" list.
   • "explanation" is optional — delete the line if you
     don't want one shown after answering.
   ============================================================ */

const questions = [
  {
    question: 'What is a programming language?',
    options: [
      'A language used to give instructions to computers',
      'A type of computer hardware',
      'A social media platform',
      'A web browser',
    ],
    correctAnswer: 0,
    explanation: 'Python, JavaScript and C++ are all programming languages.',
  },
  {
    question: 'What does HTML do on a web page?',
    options: [
      'It cools down the processor',
      'It structures the content, like headings and paragraphs',
      'It stores your photos in the cloud',
      'It charges your phone',
    ],
    correctAnswer: 1,
    explanation:
      'HTML defines the structure, CSS styles it, JavaScript makes it interactive.',
  },
  {
    question: 'What does "AI" stand for?',
    options: [
      'Automatic Internet',
      'Apple Inc.',
      'Artificial Intelligence',
      'Advanced Input',
    ],
    correctAnswer: 2,
    explanation:
      'AI means machines doing tasks that normally need human intelligence.',
  },
  {
    question: 'What is a database mainly used for?',
    options: [
      'Drawing logos',
      'Editing videos',
      'Printing documents',
      'Storing and organizing data',
    ],
    correctAnswer: 3,
    explanation:
      'Apps like Instagram use databases to keep your posts and messages.',
  },
  {
    question: 'Which of these is the strongest password?',
    options: ['123456', 'password', 'your own name', 'Moon!Tiger42#'],
    correctAnswer: 3,
    explanation:
      'Long passwords mixing letters, numbers and symbols are hardest to guess.',
  },
  {
    question: 'What is an operating system?',
    options: [
      'A screen protector',
      'The main software that runs a computer or phone',
      'A kind of mouse',
      'An internet cable',
    ],
    correctAnswer: 1,
    explanation: 'Windows, Linux and Android are all operating systems.',
  },
  {
    question: 'On your phone, the word "app" is short for…',
    options: ['Appendix', 'Appetizer', 'Application', 'Approval'],
    correctAnswer: 2,
    explanation:
      'An application is a program built for a specific job, like WhatsApp.',
  },
  {
    question: 'In software, a "bug" is…',
    options: [
      'A mistake in the code',
      'A robot vacuum cleaner',
      'A virus that damages screens',
      'A type of keyboard key',
    ],
    correctAnswer: 0,
    explanation:
      "Finding and fixing bugs is a big part of every developer's job.",
  },
  {
    question: 'What does a web developer mostly build?',
    options: [
      'Car engines',
      'Websites and web applications',
      'Mobile phone batteries',
      'Wi-Fi routers',
    ],
    correctAnswer: 1,
    explanation:
      'They use HTML, CSS and JavaScript to build things you see in a browser.',
  },
  {
    question: 'What is a web browser?',
    options: [
      'A machine that makes coffee',
      'A type of printer',
      'A computer virus',
      'A program used to visit websites, like Chrome',
    ],
    correctAnswer: 3,
    explanation: 'Chrome, Firefox, Safari and Edge are all web browsers.',
  },
  /* ------------------------------------------------------------
     Questions 11-20 — based on the "WHO ARE YOU?" session slides
     (Computer Science, tracks, learning path, GitHub, AI, careers)
     ------------------------------------------------------------ */
  {
    question: 'What is Computer Science mostly about?',
    options: [
      'Only repairing broken laptops',
      'Only typing code as fast as possible',
      'Solving problems using computing',
      'Only designing logos and posters',
    ],
    correctAnswer: 2,
    explanation:
      'Programming is an important tool, but Computer Science is a bigger field: algorithms, data, systems and building solutions.',
  },
  {
    question: 'Which IT track is about protecting systems and data from attacks?',
    options: ['Cybersecurity', 'Game art', 'Video editing', 'Data entry'],
    correctAnswer: 0,
    explanation:
      'Other tracks include Software, Data & AI, Cloud / DevOps, QA, UI/UX and Embedded Systems. Try one before you decide.',
  },
  {
    question: 'What is a smart way to start learning programming?',
    options: [
      'Learn five languages at the same time',
      'Pick one language and learn variables, conditions, loops and functions',
      'Wait until you have a perfect laptop',
      'Only watch videos and never write code',
    ],
    correctAnswer: 1,
    explanation:
      'One language that fits your goal, small daily exercises, then a simple project you improve over time.',
  },
  {
    question: 'Your code shows an error. What should you do first?',
    options: [
      'Delete the whole project and start again',
      'Ignore it and hope it disappears',
      'Close the laptop and quit',
      'Read the full error message carefully',
    ],
    correctAnswer: 3,
    explanation:
      'Error messages tell you what went wrong and where. Then find the smallest part that fails and search with clear words.',
  },
  {
    question: 'Which of these should you NEVER upload to a public GitHub repo?',
    options: [
      'Passwords and API keys',
      'A README file',
      'Your project code',
      'Clear commit messages',
    ],
    correctAnswer: 0,
    explanation:
      'Secrets in a public repo can be stolen in minutes. Use GitHub as your work notebook, but keep keys private.',
  },
  {
    question: 'What is the best way to use AI tools while learning to code?',
    options: [
      'Copy every answer without reading it',
      'Share your passwords so it can help better',
      'Use it to explain and review code, then check and understand every line',
      'Let it do all your homework and projects',
    ],
    correctAnswer: 2,
    explanation:
      'AI is a tool, not a replacement for understanding. It can make mistakes or invent information, so always verify the result.',
  },
  {
    question: 'What best shows that you can actually apply what you learned?',
    options: [
      'A small, working project you can explain',
      'Collecting as many course tabs as possible',
      'Saying "I am a fast learner"',
      'Copying a friend\'s solution',
    ],
    correctAnswer: 0,
    explanation:
      'Certificates prove you finished a course, but a project shows real ability. A few projects you understand beat many you copied.',
  },
  {
    question: 'What is the best way to combine college and self-learning?',
    options: [
      'Use only college and never build anything',
      'Skip college because the internet has everything',
      'Use only random videos with no plan',
      'College for theory and structure, self-learning for hands-on projects',
    ],
    correctAnswer: 3,
    explanation:
      'College gives you a strong base, teachers and teammates. Self-learning gives practical depth. Together they work best.',
  },
  {
    question: 'What do you mostly gain from an internship?',
    options: [
      'Learning by working with a real team',
      'A guaranteed job the next day',
      'A free laptop',
      'Nothing, it is only for experts',
    ],
    correctAnswer: 0,
    explanation:
      'An internship teaches you teamwork, deadlines and real tools. Start with tasks that match your level.',
  },
  {
    question:
      'You feel lost because there are too many tracks and courses. What is a good plan?',
    options: [
      'Start every course and finish none',
      'Compare yourself with people who started earlier',
      'Try one track for a week, build one small task, then review',
      'Wait until you know everything',
    ],
    correctAnswer: 2,
    explanation:
      'You do not need to know everything. One field, one source and one small project is enough to take your next step.',
  },
];

export { questions };
