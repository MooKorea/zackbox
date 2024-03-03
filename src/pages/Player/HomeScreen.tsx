import { useEffect, useState, useRef } from "react";

interface HomeScreen {
  setIsGameEnter: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function HomeScreen({ setIsGameEnter }: HomeScreen) {
  const inputRef = useRef<HTMLInputElement>(null!);

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const code = urlParams.get("code");
    if (code === null) return;
    inputRef.current.value = code;
    setCodeInput(code);
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (codeInput.length === 4) setIsGameEnter(true);
  };

  const [codeInput, setCodeInput] = useState("");

  return (
    <>
      <h1>ZACKBOX!</h1>
      <form className="flex flex-col items-center gap-4" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          autoComplete="off"
          type="text"
          name="code"
          maxLength={4}
          placeholder="Enter Code"
          onChange={(e) => setCodeInput(e.target.value)}
          className="py-2 rounded-lg px-2 text-lg font-bold text-center tracking-wide w-[8rem]"
        />
        <input
          type="submit"
          value="GO!"
          className={`text-white rounded-lg transition-all h-12 w-[8rem] font-extrabold tracking-wide ${
            codeInput.length === 4
              ? "bg-primary"
              : "bg-gray-600 text-gray-400 pointer-events-none"
          }`}
        />
      </form>
    </>
  );
}
