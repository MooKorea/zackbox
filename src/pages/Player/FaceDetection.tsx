import * as faceapi from "face-api.js";
import { useRef, useEffect, useState } from "react";

export default function FaceDetection() {
  const videoRef = useRef<HTMLVideoElement>(null!);
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const [isInFrame, setIsInFrame] = useState(false);
  const [isAreaFit, setIsAreaFit] = useState(false);

  function handleFaceInRange(
    width: number,
    height: number,
    tl: faceapi.Point,
    tr: faceapi.Point,
    bl: faceapi.Point,
    br: faceapi.Point
  ) {
    const midX = width * 0.5;
    const midY = height * 0.5;
    const tlCheck = tl.x < midX && tl.y < midY;
    const trCheck = tr.x > midX;
    const blCheck = bl.y > midY;
    setIsInFrame(tlCheck && trCheck && blCheck);
  }

  useEffect(() => {
    window.CancelFaceTrack = true;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    async function handleFaceTrack() {
      if (!window.CancelFaceTrack) return;
      const detections = await faceapi.detectSingleFace(
        video,
        new faceapi.TinyFaceDetectorOptions()
      );

      if (detections !== undefined) {
        const displaySize = { width: video.clientWidth, height: video.clientHeight };
        faceapi.matchDimensions(canvas, displaySize);
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        setIsAreaFit(resizedDetections.box.area > 20000);
        handleFaceInRange(
          video.clientWidth,
          video.clientHeight,
          resizedDetections.box.topLeft,
          resizedDetections.box.topRight,
          resizedDetections.box.bottomLeft,
          resizedDetections.box.bottomRight
        );

        canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
      }

      setTimeout(() => {
        handleFaceTrack();
      }, 100);
    }

    (async () => {
      if (!navigator.mediaDevices.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      video.addEventListener("loadedmetadata", async () => {
        console.log("video playing");
        video.play();
        await faceapi.nets.tinyFaceDetector.loadFromUri("./Face_Track");
        handleFaceTrack();
      });
    })();
  }, []);

  return (
    <>
      <div>{isInFrame ? "face centered" : "face not centered"}</div>
      <div>{isAreaFit ? "face big enough" : "face not big enough"}</div>

      <div className="relative w-screen">
        <video ref={videoRef} style={{ transform: "rotateY(180deg)" }}></video>
        <canvas
          ref={canvasRef}
          className="absolute top-0"
          style={{ transform: "rotateY(180deg)" }}
        ></canvas>
        <button
          id="stop-interval-button"
          onClick={() => {
            window.CancelFaceTrack = false;
          }}
        >
          Stop
        </button>
      </div>
    </>
  );
}
