/* ============================================================
   TROSC · IT Challenge — Question bank
   ------------------------------------------------------------
   HOW TO EDIT:
   • Add, remove or reorder objects in the array below.
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
];

export { questions };
