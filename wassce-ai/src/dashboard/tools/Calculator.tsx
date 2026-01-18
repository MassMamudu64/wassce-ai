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

  const calculate = (firstValue: number, secondValue: number, nextOperation: string): number => {
    switch (nextOperation) {
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

  const numberButtonClass =
    "rounded border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300";
  const actionButtonClass =
    "rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100";

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Exam Calculator</p>
        <h3 className="text-lg font-semibold text-slate-900">Scientific Calculator</h3>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-4 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-right text-xl font-mono text-slate-900">
          {display}
        </div>

        <div className="grid grid-cols-4 gap-2">
          <button onClick={clear} className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
            C
          </button>
          <button onClick={() => performOperation("/")} className={actionButtonClass}>
            /
          </button>
          <button onClick={() => performOperation("*")} className={actionButtonClass}>
            *
          </button>
          <button onClick={() => performOperation("-")} className={actionButtonClass}>
            -
          </button>

          <button onClick={() => inputDigit("7")} className={numberButtonClass}>
            7
          </button>
          <button onClick={() => inputDigit("8")} className={numberButtonClass}>
            8
          </button>
          <button onClick={() => inputDigit("9")} className={numberButtonClass}>
            9
          </button>
          <button onClick={() => performOperation("+")} className={`${actionButtonClass} row-span-2`}>
            +
          </button>

          <button onClick={() => inputDigit("4")} className={numberButtonClass}>
            4
          </button>
          <button onClick={() => inputDigit("5")} className={numberButtonClass}>
            5
          </button>
          <button onClick={() => inputDigit("6")} className={numberButtonClass}>
            6
          </button>

          <button onClick={() => inputDigit("1")} className={numberButtonClass}>
            1
          </button>
          <button onClick={() => inputDigit("2")} className={numberButtonClass}>
            2
          </button>
          <button onClick={() => inputDigit("3")} className={numberButtonClass}>
            3
          </button>
          <button onClick={handleEquals} className="row-span-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
            =
          </button>

          <button onClick={() => inputDigit("0")} className={`${numberButtonClass} col-span-2`}>
            0
          </button>
          <button onClick={inputDecimal} className={numberButtonClass}>
            .
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
