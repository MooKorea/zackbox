import { useRef, useState } from "react";
import useFaceDetection from "./useFaceDetection";
import FaceGraphic from "./FaceGraphic";

export default function FaceDetection() {
  const videoRef = useRef<HTMLVideoElement>(null!);
  const canvasRef = useRef<HTMLCanvasElement>(null!);

  const [isFaceCaptured, setIsFaceCaptured] = useState(false);

  const { isInFrame, isAreaFit, dimensions, isFaceDetected, handleFaceTrack } =
    useFaceDetection(videoRef, canvasRef, isFaceCaptured);

  const pillX = (dimensions.x / 3) * 1.25;
  const pillY = (dimensions.x / 3) * 1.7;

  const photoCanvasRef = useRef<HTMLCanvasElement>(null!);
  const photoCanvasRef2 = useRef<HTMLCanvasElement>(null!);
  const takePhoto = () => {
    if (!(isAreaFit && isInFrame && isFaceDetected)) return;
    if (isFaceCaptured) return;
    setIsFaceCaptured(true);
    window.FaceTrack = false;

    const canvas = photoCanvasRef.current;
    const context = canvas.getContext("2d");
    context?.drawImage(videoRef.current, 0, 0, dimensions.x, dimensions.y);

    const canvas2 = photoCanvasRef2.current;
    const context2 = canvas2.getContext("2d");
    context2?.drawImage(
      canvas,
      (dimensions.x - pillX) / 2,
      (dimensions.y - pillY) / 2,
      pillX,
      pillY,
      0,
      0,
      pillX,
      pillY
    );

    const frame = canvas.toDataURL("image/png");
  };

  let status: string;
  if (!isFaceDetected) {
    status = "No face detected";
  } else if (!isAreaFit) {
    status = "Face not big enough";
  } else if (!isInFrame) {
    status = "Face not centered";
  } else {
    status = "Ready to capture!";
  }

  return (
    <div className="w-full flex flex-col items-center justify-center gap-4">
      <div>{status}</div>
      <div className="relative w-screen px-12 flex justify-center">
        <video
          ref={videoRef}
          className="brightness-[0.2] rounded-lg"
          style={{ transform: "rotateY(180deg)" }}
        ></video>
        <canvas
          ref={canvasRef}
          className="absolute top-0"
          style={{ transform: "rotateY(180deg)" }}
        ></canvas>
        <div
          className="absolute top-[50%] -translate-y-1/2 bg-[#c4c4c4] rounded-full mix-blend-color-dodge"
          style={{ width: pillX, height: pillY }}
        ></div>
        <canvas
          ref={photoCanvasRef2}
          width={pillX}
          height={pillY}
          className="absolute top-[50%] -translate-y-1/2 rounded-full -scale-x-100"
        ></canvas>
        <FaceGraphic
          className="absolute top-[50%] -translate-y-1/2 scale-[1.3]"
          width={dimensions.x / 3}
          isValid={isAreaFit && isInFrame}
          isFaceCaptured={isFaceCaptured}
        />
      </div>
      {isFaceCaptured ? (
        <button
          id="stop-interval-button"
          onClick={() => {
            setIsFaceCaptured(false);
            window.FaceTrack = true;
            handleFaceTrack(videoRef.current, canvasRef.current);
            photoCanvasRef2.current
              .getContext("2d")
              ?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          }}
          className={`text-white rounded-lg transition-all h-12 w-[8rem] font-extrabold tracking-wide bg-primary`}
        >
          Retake
        </button>
      ) : (
        <button
          id="stop-interval-button"
          onClick={() => {
            takePhoto();
          }}
          className={`text-white rounded-lg transition-all h-12 w-[8rem] font-extrabold tracking-wide ${
            isAreaFit && isInFrame && !isFaceCaptured
              ? "bg-primary"
              : "bg-gray-600 text-gray-400 pointer-events-none"
          }`}
        >
          Take Photo
        </button>
      )}
      <canvas
        className="hidden"
        ref={photoCanvasRef}
        width={dimensions.x}
        height={dimensions.y}
      ></canvas>
    </div>
  );
}
