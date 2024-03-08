import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { get, ref } from "firebase/database";
import { useAppContext } from "../../Contexts";

export default function Player() {
  const inputRef = useRef<HTMLInputElement>(null!);
  const navigate = useNavigate();
  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const code = urlParams.get("code");
    if (code === null) return;
    inputRef.current.value = code;
    setCodeInput(code);
  }, []);

  const [isInvalidCode, setIsInvalidCode] = useState(false);
  const { setCode } = useAppContext();
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    // if (import.meta.env.MODE === "development") {
    //   navigate("/photo");
    //   return;
    // }

    if (codeInput.length !== 4) return;

    const checkRef = ref(db, `games/${codeInput}`);
    const snapshot = await get(checkRef);
    if (snapshot.val() === null) {
      setIsInvalidCode(true);
    } else {
      setCode(snapshot.val().code);
      navigate("/photo");
    }

  };

  const [codeInput, setCodeInput] = useState("");

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center">
      <h1>ZACKBOX!</h1>
      <form className="relative flex flex-col items-center gap-4" onSubmit={handleSubmit}>
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
        {isInvalidCode && (
          <div className="absolute bottom-[-2.5rem] text-red-400">Invalid Code!</div>
        )}
      </form>
    </div>
  );
}

// export default function Player() {
//   const [isCanvas, setIsCanvas] = useState(false);
//   const [isGameEnter, setIsGameEnter] = useState(false);
//   const [isPhotoSubmitted, setIsPhotoSubmitted] = useState(false)

//   return (
//     <div className="w-screen h-screen flex flex-col items-center justify-center">
//       {!isGameEnter && <HomeScreen setIsGameEnter={setIsGameEnter} />}
//       {isGameEnter && <FaceDetection setIsPhotoSubmitted={setIsPhotoSubmitted} />}
//       {/* <button onClick={() => setIsCanvas(true)}>enter canvas</button> */}
//       {/* <div className={isCanvas ? "block" : "hidden"}>
//         <UnityPlayer setIsCanvas={setIsCanvas} />
//       </div> */}
//     </div>
//   );
// }
