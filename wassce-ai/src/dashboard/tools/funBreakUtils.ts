export type MathState = {
  question: string;
  solution: number;
};

const wordPrompts = [
  "Name 5 animals that live in water",
  "List 3 African countries",
  "Name 4 programming languages",
];

export const createMathState = (): MathState => {
  const a = Math.floor(Math.random() * 20) + 1;
  const b = Math.floor(Math.random() * 20) + 1;
  const ops = ["+", "-", "*"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  const sol = op === "+" ? a + b : op === "-" ? a - b : a * b;
  return { question: `${a} ${op} ${b}`, solution: sol };
};

export const createMemoryCards = () =>
  [1, 1, 2, 2, 3, 3, 4, 4].sort(() => Math.random() - 0.5);

export const createWordPrompt = () =>
  wordPrompts[Math.floor(Math.random() * wordPrompts.length)];
