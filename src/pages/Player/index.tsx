import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { get, ref } from "firebase/database";
import { useAppContext } from "../../Contexts";
import { PinInput } from "react-input-pin-code";

export default function Player() {
  const [codeInput, setCodeInput] = useState(["", "", "", ""]);
  const [isScanned, setIsScanned] = useState(false)
  const [nameInput, setNameInput] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null!);
  const navigate = useNavigate();
  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const code = urlParams.get("code");
    if (code === null) return;
    setCodeInput(code.split(""));
    nameInputRef.current.focus();
  }, []);

  const [isInvalidCode, setIsInvalidCode] = useState(false);
  const { setCode, setName } = useAppContext();
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (codeInput.join('').length !== 4) return;

    const checkRef = ref(db, `games/${codeInput.join('')}`);
    const snapshot = await get(checkRef);
    if (snapshot.val() === null) {
      setIsInvalidCode(true);
    } else {
      setCode(snapshot.val().code);
      setName(nameInput);
      navigate("/photo");
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center">
      <h1>ZACKBOX!</h1>
      <form className="relative flex flex-col items-center gap-4" onSubmit={handleSubmit}>
        <div className={`bottom-[-2.5rem] ${isInvalidCode ? "text-red-400" : "text-gray-400"}`}>{isInvalidCode ? "Invalid Code!" : "Enter Code"}</div>
        <PinInput
          values={codeInput}
          onChange={(value, index, values) => setCodeInput(values.map(e => e === " " ? "" : e))}
          autoFocus
          type="text"
          inputClassName="font-nunito font-bold text-white"
          placeholder=""
          borderColor="rgb(90, 90, 90)"
          focusBorderColor="rgb(83, 69, 245)"
          validBorderColor="rgb(83, 69, 245)"
        />
        <input
          ref={nameInputRef}
          type="text"
          name="name"
          maxLength={15}
          placeholder="Enter Name"
          onChange={(e) => setNameInput(e.target.value)}
          className="py-2 rounded-lg px-2 text-lg font-bold text-center tracking-wide w-[8rem]"
        />
        <input
          type="submit"
          value="GO!"
          className={`text-white cursor-pointer rounded-lg transition-all h-12 w-[8rem] font-extrabold tracking-wide ${
            codeInput.join('').length === 4 && nameInput.length > 0
              ? "bg-primary"
              : "bg-gray-600 text-gray-400 pointer-events-none"
          }`}
        />
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
