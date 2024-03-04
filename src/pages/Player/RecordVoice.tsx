import { useEffect, useRef, useState } from "react";
import { useAudioRecorder } from "react-audio-voice-recorder";
import { motion, useAnimate } from "framer-motion";

function volumeCurve(x: number) {
  return 1 - 1 / (1 + 20 * x);
}

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number) => {
    return {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { type: "spring", duration: 1.5, bounce: 0 },
        opacity: { duration: 0.01 },
      },
    };
  },
};

export default function RecordVoice() {
  const ref = useRef<HTMLDivElement>(null!);
  const audioRef = useRef<HTMLAudioElement>(null!);
  const { startRecording, stopRecording, recordingBlob, isRecording } =
    useAudioRecorder();
  const [isAudioThreshold, setIsAudioThreshold] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const voiceThreshold = 0.04;
  const onFrame = (analyserNode: AnalyserNode, pcmData: Float32Array) => {
    if (!window.IsAudioRecord) return;
    analyserNode.getFloatTimeDomainData(pcmData);
    let sumSquares = 0.0;
    for (const amplitude of pcmData) {
      sumSquares += amplitude * amplitude;
    }

    const volumeLevel = Math.sqrt(sumSquares / pcmData.length);
    const circleRadius = 50 + volumeCurve(volumeLevel) * 200;
    ref.current.style.width = `${circleRadius}px`;
    ref.current.style.height = `${circleRadius}px`;

    setIsAudioThreshold(volumeLevel > voiceThreshold);
    window.requestAnimationFrame(() => onFrame(analyserNode, pcmData));
  };

  const handleRecord = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    const audioContext = new AudioContext();
    const mediaStreamAudioSourceNode = audioContext.createMediaStreamSource(stream);
    const analyserNode = audioContext.createAnalyser();
    mediaStreamAudioSourceNode.connect(analyserNode);
    const pcmData = new Float32Array(analyserNode.fftSize);
    window.requestAnimationFrame(() => onFrame(analyserNode, pcmData));
  };

  const [scope, animate] = useAnimate();
  useEffect(() => {
    if (!isAudioThreshold || isRecording) return;
    startRecording();
    animate(
      scope.current,
      {
        pathLength: 1,
      },
      {
        duration: 1.5,
        onComplete: () => {
          setIsFinished(true);
          setIsListening(false);
          window.IsAudioRecord = false;
        },
      }
    );
  }, [isAudioThreshold]);

  useEffect(() => {
    if (!isFinished) return;
    stopRecording();
  }, [isFinished]);

  useEffect(() => {
    if (!recordingBlob) return;
    const url = URL.createObjectURL(recordingBlob);
    audioRef.current.src = url;
    audioRef.current.controls = true;
  }, [recordingBlob]);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center gap-4">
      <div>{isFinished ? "Recording Complete!" : "Make a 1 second sound!"}</div>
      <div className="w-[15rem] h-[15rem] rounded-full border-gray-600 border-2 flex items-center justify-center">
        <div ref={ref} className="bg-[#5345f5]/[0.3] rounded-full absolute"></div>
        <div
          className={`absolute rounded-full border-2 ${
            isAudioThreshold ? "border-green-500" : "border-gray-400"
          }`}
          style={{
            width: `${volumeCurve(voiceThreshold) * 200 + 50}px`,
            height: `${volumeCurve(voiceThreshold) * 200 + 50}px`,
          }}
        ></div>
        <motion.svg
          className="rotate-90 -scale-x-100"
          width="110%"
          height="110%"
          initial="hidden"
          animate="visible"
        >
          <motion.circle
            cx="50%"
            cy="50%"
            r="47%"
            stroke="#5345f5"
            strokeWidth={4}
            fill="none"
            ref={scope}
          />
        </motion.svg>
      </div>
      <div className="w-full md:w-[30rem] px-12 gap-4 flex flex-col items-center h-[12rem]">
        <button
          onClick={() => {
            window.IsAudioRecord = true;
            setIsListening(true);
            setIsFinished(false);
            handleRecord();
            animate(scope.current, {
              pathLength: 0,
            });
          }}
          className={`text-white rounded-lg border-primary transition-colors h-12 w-[8rem] font-extrabold tracking-wide ${
            !isListening
              ? `${isFinished ? "border-4" : "bg-primary"}`
              : "bg-gray-600 text-gray-400 pointer-events-none"
          }`}
        >
          Record Voice
        </button>

        <audio
          ref={audioRef}
          controls
          className={`${isFinished ? "block w-full" : "hidden"}`}
        ></audio>

        <button
          onClick={() => {
            console.log("next");
          }}
          className={`text-white rounded-lg transition-all h-12 w-[8rem] font-extrabold tracking-wide ${
            isFinished ? "bg-primary" : "bg-gray-600 text-gray-400 pointer-events-none"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
