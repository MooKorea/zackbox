import UnityPlayer from "./UnityPlayer";
import { useState } from "react";
import HomeScreen from "./HomeScreen";
import FaceDetection from "./FaceDetection";

export default function Player() {
  const [isCanvas, setIsCanvas] = useState(false);
  const [isGameEnter, setIsGameEnter] = useState(false);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center">
      {!isGameEnter && <HomeScreen setIsGameEnter={setIsGameEnter} />}
      {isGameEnter && <FaceDetection />}
      {/* <button onClick={() => setIsCanvas(true)}>enter canvas</button> */}
      {/* <div className={isCanvas ? "block" : "hidden"}>
        <UnityPlayer setIsCanvas={setIsCanvas} />
      </div> */}
    </div>
  );
}
