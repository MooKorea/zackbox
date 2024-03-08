import { useEffect, useRef, useState } from "react";
import { useAudioRecorder } from "react-audio-voice-recorder";
import { motion, useAnimate } from "framer-motion";
import { useAppContext } from "../../Contexts";
import * as FFmpeg from "@ffmpeg/ffmpeg";

function volumeCurve(x: number) {
  return 1 - 1 / (1 + 20 * x);
}

interface RecordVoice {
  setVoiceSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function RecordVoice({ setVoiceSubmitted }: RecordVoice) {
  const ref = useRef<HTMLDivElement>(null!);
  const audioRef = useRef<HTMLAudioElement>(null!);
  const { startRecording, stopRecording, recordingBlob, isRecording } =
    useAudioRecorder();
  const [isAudioThreshold, setIsAudioThreshold] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const voiceThreshold = 0.02;
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

  const convertToDownloadFileExtension = async (webmBlob: Blob, fileExtension: "wav" | "mp3"): Promise<Blob> => {
    const ffmpeg = FFmpeg.createFFmpeg({ log: false });
    await ffmpeg.load();

    const inputName = "input.webm";
    const outputName = `output.${fileExtension}`;

    ffmpeg.FS("writeFile", inputName, new Uint8Array(await webmBlob.arrayBuffer()));

    await ffmpeg.run("-i", inputName, outputName);

    const outputData = ffmpeg.FS("readFile", outputName);
    const outputBlob = new Blob([outputData.buffer], {
      type: `audio/${fileExtension}`,
    });

    return outputBlob;
  };

  const { setVoiceDataURL, setVoiceBlob } = useAppContext();
  useEffect(() => {
    if (!recordingBlob) return;
    (async () => {

      const url = URL.createObjectURL(recordingBlob);
      audioRef.current.src = url;
      audioRef.current.controls = true;
      
      const wavBlob = convertToDownloadFileExtension(recordingBlob, "wav");
      const mp3Blob = convertToDownloadFileExtension(recordingBlob, "mp3");
      const [wavRes, mp3Res] = await Promise.all([wavBlob, mp3Blob])
      const reader = new FileReader();
      reader.readAsDataURL(wavRes);
      reader.onloadend = () => {
        setVoiceDataURL(reader.result as string);
      };
      setVoiceBlob(mp3Res)

    })();
  }, [recordingBlob]);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center gap-4 z-10">
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
            setVoiceSubmitted(true);
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
function createFFmpeg(arg0: { log: boolean }) {
  throw new Error("Function not implemented.");
}
