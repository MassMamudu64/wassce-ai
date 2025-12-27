import type { Subject } from "../../../types/domain";
import type { QuizQuestion } from "./quizTypes";

export const quizSubjects: Subject[] = [
  "integrated_science",
  "math",
  "english",
  "biology",
  "chemistry",
  "physics",
  "economics",
  "government",
];

const sampleQuestions: QuizQuestion[] = [
  {
    id: "chem-1",
    subject: "chemistry",
    topic: "Fundamentals",
    question: "What is the chemical formula for water?",
    options: ["H2O", "CO2", "NaCl", "O2"],
    correctIndex: 0,
    explanation: "Water consists of two hydrogen atoms and one oxygen atom.",
  },
  {
    id: "chem-2",
    subject: "chemistry",
    topic: "Gases",
    question: "Which gas turns limewater milky?",
    options: ["Oxygen", "Carbon dioxide", "Hydrogen", "Nitrogen"],
    correctIndex: 1,
    explanation:
      "Carbon dioxide reacts with limewater (calcium hydroxide) to form insoluble calcium carbonate, making it milky.",
  },
  {
    id: "math-1",
    subject: "math",
    topic: "Constants",
    question: "In mathematics, what is the value of π (pi) approximately?",
    options: ["3.14", "2.71", "1.41", "1.73"],
    correctIndex: 0,
    explanation: "π is approximately 3.14159, commonly rounded to 3.14.",
  },
  {
    id: "math-2",
    subject: "math",
    topic: "Linear equations",
    question: "Solve: 2x + 3 = 11",
    options: ["2", "4", "6", "7"],
    correctIndex: 1,
    explanation: "2x = 8 so x = 4.",
  },
  {
    id: "integrated-1",
    subject: "integrated_science",
    topic: "Measurement",
    question: "Which instrument is best for measuring the diameter of a small wire accurately?",
    options: ["Metre rule", "Micrometer screw gauge", "Thermometer", "Stopwatch"],
    correctIndex: 1,
    explanation: "A micrometer screw gauge is designed for precise measurement of small diameters.",
  },
  {
    id: "integrated-2",
    subject: "integrated_science",
    topic: "Energy",
    question: "Which of the following is a renewable source of energy?",
    options: ["Coal", "Natural gas", "Solar", "Diesel"],
    correctIndex: 2,
    explanation: "Solar energy is renewable because it is replenished naturally.",
  },
  {
    id: "english-1",
    subject: "english",
    topic: "Grammar",
    question: "Choose the correct sentence.",
    options: [
      "She don't like mangoes.",
      "She doesn't likes mangoes.",
      "She doesn't like mangoes.",
      "She not like mangoes.",
    ],
    correctIndex: 2,
    explanation: "With 'she', use 'doesn't' + base verb: 'doesn't like'.",
  },
  {
    id: "biology-1",
    subject: "biology",
    topic: "Cells",
    question: "Which organelle is mainly responsible for producing energy (ATP) in cells?",
    options: ["Ribosome", "Mitochondrion", "Nucleus", "Golgi body"],
    correctIndex: 1,
    explanation: "Mitochondria are the sites of aerobic respiration and ATP production.",
  },
  {
    id: "physics-1",
    subject: "physics",
    topic: "Quantities",
    question: "Which of the following physical quantities is a scalar quantity?",
    options: ["Velocity", "Force", "Mass", "Acceleration"],
    correctIndex: 2,
    explanation: "Mass has magnitude only (scalar). Velocity, force, and acceleration have direction (vectors).",
  },
];

export const getSampleQuestions = (subject: Subject) => sampleQuestions.filter((q) => q.subject === subject);

