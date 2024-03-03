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
    setIsAreaFit(tr.x / width - tl.x / width > 0.4)
    const midX = (width * 0.5) / width;
    const midY = (height * 0.5) / height;
    
    const gapRadius = 0.1
    const tlCheck = tl.x / width < midX - gapRadius && tl.y / height < midY - gapRadius;
    const trCheck = tr.x / width > midX + gapRadius;
    const blCheck = bl.y / height > midY + gapRadius;
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

      <div className="relative w-screen px-12">
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
