import { useRef } from "react";
import useFaceDetection from "./useFaceDetection";
import FaceGraphic from "./FaceGraphic";

export default function FaceDetection() {
  const videoRef = useRef<HTMLVideoElement>(null!);
  const canvasRef = useRef<HTMLCanvasElement>(null!);

  const { isInFrame, isAreaFit, dimensions } = useFaceDetection(videoRef, canvasRef);

  return (
    <>
      <div>{isInFrame ? "face centered" : "face not centered"}</div>
      <div>{isAreaFit ? "face big enough" : "face not big enough"}</div>
      <div className="relative w-screen px-12 flex justify-center">
        <video
          ref={videoRef}
          className="brightness-[0.2]"
          style={{ transform: "rotateY(180deg)" }}
        ></video>
        <canvas
          ref={canvasRef}
          className="absolute top-0"
          style={{ transform: "rotateY(180deg)" }}
        ></canvas>
        <div className="absolute top-[50%] -translate-y-1/2 w-[15rem] h-[19rem] bg-[#c4c4c4] rounded-full mix-blend-color-dodge"></div>
        <div
          className="h-full absolute flex justify-center"
          style={{ width: dimensions.x }}
        >
        </div>
        <FaceGraphic
          className="absolute top-[50%] -translate-y-1/2 scale-[1.3]"
          isValid={isAreaFit && isInFrame}
        />
      </div>
      <button
        id="stop-interval-button"
        onClick={() => {
          window.CancelFaceTrack = false;
        }}
      >
        Stop
      </button>
    </>
  );
}
