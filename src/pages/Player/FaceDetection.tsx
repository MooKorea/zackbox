import { useRef, useState } from "react";
import useFaceDetection from "./useFaceDetection";
import FaceGraphic from "./FaceGraphic";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../Contexts";

export default function FaceDetection() {
  const videoRef = useRef<HTMLVideoElement>(null!);
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const navigate = useNavigate();
  const { setFaceDataURL, setSkinColor } = useAppContext();

  const [isFaceCaptured, setIsFaceCaptured] = useState(false);

  const face = useFaceDetection(videoRef, canvasRef, isFaceCaptured);

  const pillX = (face.dimensions.x / 3) * 1.25;
  const pillY = (face.dimensions.x / 3) * 1.7;

  const photoCanvasRef = useRef<HTMLCanvasElement>(null!);
  const photoCanvasRef2 = useRef<HTMLCanvasElement>(null!);
  const takePhoto = () => {
    if (!(face.isAreaFit && face.isInFrame && face.isFaceDetected)) return;
    if (isFaceCaptured) return;
    setIsFaceCaptured(true);
    window.FaceTrack = false;

    const canvas = photoCanvasRef.current;
    const context = canvas.getContext("2d");
    context?.drawImage(videoRef.current, 0, 0, face.dimensions.x, face.dimensions.y);

    const canvas2 = photoCanvasRef2.current;
    const context2 = canvas2.getContext("2d");
    context2?.drawImage(
      canvas,
      (face.dimensions.x - pillX) / 2,
      (face.dimensions.y - pillY) / 2,
      pillX,
      pillY,
      0,
      0,
      pillX,
      pillY
    );

    const frame = canvas2.toDataURL("image/png");
    const pixel = context2?.getImageData(pillX / 2, pillY / 2, 1, 1).data
    // console.log(pixel!.join("x"))
    setSkinColor(pixel!.join("x"))
    setFaceDataURL(frame);
  };

  let status: string;
  if (!face.isFaceDetected) {
    status = "No face detected";
  } else if (!face.isAreaFit) {
    status = "Face not big enough";
  } else if (!face.isInFrame) {
    status = "Face not centered";
  } else {
    status = "Ready to capture!";
  }

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center gap-4">
      <div>{isFaceCaptured ? "Photo taken!" : status}</div>
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
          width={face.dimensions.x / 3}
          isValid={face.isAreaFit && face.isInFrame && face.isFaceDetected}
          isFaceCaptured={isFaceCaptured}
        />
      </div>
      {isFaceCaptured ? (
        <button
          id="stop-interval-button"
          onClick={() => {
            setIsFaceCaptured(false);
            window.FaceTrack = true;
            face.handleFaceTrack(videoRef.current, canvasRef.current);
            photoCanvasRef2.current
              .getContext("2d")
              ?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          }}
          className={`text-white rounded-lg transition-colors h-12 w-[8rem] font-extrabold tracking-wide border-4 border-primary`}
        >
          Retake
        </button>
      ) : (
        <button
          onClick={() => {
            takePhoto();
          }}
          className={`text-white rounded-lg transition-all h-12 w-[8rem] font-extrabold tracking-wide ${
            face.isAreaFit && face.isInFrame && face.isFaceDetected
              ? "bg-primary"
              : "bg-gray-600 text-gray-400 pointer-events-none"
          }`}
        >
          Take Photo
        </button>
      )}
      <button
        onClick={() => {
          navigate("/controls");
        }}
        className={`text-white rounded-lg transition-all h-12 w-[8rem] font-extrabold tracking-wide ${
          isFaceCaptured
            ? "bg-primary"
            : "border-gray-600 border-4 text-gray-500 pointer-events-none"
        }`}
      >
        Next
      </button>
      <canvas
        className="hidden"
        ref={photoCanvasRef}
        width={face.dimensions.x}
        height={face.dimensions.y}
      ></canvas>
    </div>
  );
}
