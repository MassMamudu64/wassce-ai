import { useState } from "react";

const Calculator = () => {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".");
    }
  };

  const clear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case "+":
        return firstValue + secondValue;
      case "-":
        return firstValue - secondValue;
      case "*":
        return firstValue * secondValue;
      case "/":
        return firstValue / secondValue;
      case "=":
        return secondValue;
      default:
        return secondValue;
    }
  };

  const handleEquals = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-gradient-to-br from-amber-500/10 to-amber-500/30 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Exam Calculator</p>
          <h3 className="text-lg font-semibold text-white">Scientific Calculator</h3>
        </div>
      </div>

      <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-4">
        <div className="mb-4 rounded border border-amber-400 bg-slate-900 px-3 py-2 text-right text-xl font-mono text-amber-200">
          {display}
        </div>

        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={clear}
            className="rounded border border-red-400 bg-red-400/20 px-3 py-2 text-sm font-semibold text-red-200 hover:bg-red-400/30"
          >
            C
          </button>
          <button
            onClick={() => performOperation("/")}
            className="rounded border border-amber-400 bg-amber-400/20 px-3 py-2 text-sm font-semibold text-amber-200 hover:bg-amber-400/30"
          >
            ÷
          </button>
          <button
            onClick={() => performOperation("*")}
            className="rounded border border-amber-400 bg-amber-400/20 px-3 py-2 text-sm font-semibold text-amber-200 hover:bg-amber-400/30"
          >
            ×
          </button>
          <button
            onClick={() => performOperation("-")}
            className="rounded border border-amber-400 bg-amber-400/20 px-3 py-2 text-sm font-semibold text-amber-200 hover:bg-amber-400/30"
          >
            −
          </button>

          <button
            onClick={() => inputDigit("7")}
            className="rounded border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-slate-500"
          >
            7
          </button>
          <button
            onClick={() => inputDigit("8")}
            className="rounded border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-slate-500"
          >
            8
          </button>
          <button
            onClick={() => inputDigit("9")}
            className="rounded border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-slate-500"
          >
            9
          </button>
          <button
            onClick={() => performOperation("+")}
            className="row-span-2 rounded border border-amber-400 bg-amber-400/20 px-3 py-2 text-sm font-semibold text-amber-200 hover:bg-amber-400/30"
          >
            +
          </button>

          <button
            onClick={() => inputDigit("4")}
            className="rounded border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-slate-500"
          >
            4
          </button>
          <button
            onClick={() => inputDigit("5")}
            className="rounded border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-slate-500"
          >
            5
          </button>
          <button
            onClick={() => inputDigit("6")}
            className="rounded border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-slate-500"
          >
            6
          </button>

          <button
            onClick={() => inputDigit("1")}
            className="rounded border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-slate-500"
          >
            1
          </button>
          <button
            onClick={() => inputDigit("2")}
            className="rounded border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-slate-500"
          >
            2
          </button>
          <button
            onClick={() => inputDigit("3")}
            className="rounded border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-slate-500"
          >
            3
          </button>
          <button
            onClick={handleEquals}
            className="row-span-2 rounded border border-green-400 bg-green-400/20 px-3 py-2 text-sm font-semibold text-green-200 hover:bg-green-400/30"
          >
            =
          </button>

          <button
            onClick={() => inputDigit("0")}
            className="col-span-2 rounded border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-slate-500"
          >
            0
          </button>
          <button
            onClick={inputDecimal}
            className="rounded border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-slate-500"
          >
            .
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
