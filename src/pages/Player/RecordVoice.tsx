import { useEffect, useRef, useState } from "react";
import { useAudioRecorder } from "react-audio-voice-recorder";
import getBlobDuration from "get-blob-duration";

function volumeCurve(x: number) {
  return 1 - 1 / (1 + 20 * x);
}

export default function RecordVoice() {
  const ref = useRef<HTMLDivElement>(null!);
  const audioRef = useRef<HTMLAudioElement>(null!);
  const { startRecording, stopRecording, recordingBlob } = useAudioRecorder();
  const [isValidAudio, setIsValidAudio] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isValidRecording, setIsValidRecording] = useState(false);
  const [status, setStatus] = useState("Make a 1 second Sound!");

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

    setIsValidAudio(volumeLevel > voiceThreshold);
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

  useEffect(() => {
    if (isValidAudio) {
      startRecording();
    } else {
      stopRecording();
      window.IsAudioRecord = false;
      setIsRecording(false);
    }
  }, [isValidAudio]);

  useEffect(() => {
    if (!recordingBlob) return;
    const url = URL.createObjectURL(recordingBlob);
    (async function () {
      try {
        const duration = await getBlobDuration(recordingBlob);
        if (duration < 0.2) {
          setIsValidRecording(false);
          setStatus("Recording too short!");
          return;
        } else if (duration > 1.5) {
          setIsValidRecording(false);
          setStatus("Recording too long!");
          return;
        }
        setIsValidRecording(true);
        setStatus("Recording complete!");
        audioRef.current.src = url;
        audioRef.current.controls = true;
      } catch (error) {
        setIsValidRecording(false);
        setStatus("Recording too short!");
        console.error(error);
      }
    })();
  }, [recordingBlob]);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center gap-4">
      <div>{status}</div>
      <div className="w-[15rem] h-[15rem] rounded-full border-gray-600 border-2 flex items-center justify-center">
        <div ref={ref} className="bg-[#5345f5]/[0.3] rounded-full absolute"></div>
        <div
          className={`absolute rounded-full border-2 ${
            isValidAudio ? "border-green-500" : "border-gray-400"
          }`}
          style={{
            width: `${volumeCurve(voiceThreshold) * 200 + 50}px`,
            height: `${volumeCurve(voiceThreshold) * 200 + 50}px`,
          }}
        ></div>
      </div>
      <div className="w-full md:w-[30rem] px-12 gap-4 flex flex-col items-center h-[12rem]">
        <button
          onClick={() => {
            window.IsAudioRecord = true;
            setIsRecording(true);
            setIsValidRecording(false);
            handleRecord();
          }}
          className={`text-white rounded-lg border-primary transition-colors h-12 w-[8rem] font-extrabold tracking-wide ${
            !isRecording
              ? `${isValidRecording ? "border-4" : "bg-primary"}`
              : "bg-gray-600 text-gray-400 pointer-events-none"
          }`}
        >
          Record Voice
        </button>

        <audio
          ref={audioRef}
          controls
          className={`${isValidRecording ? "block w-full" : "hidden"}`}
        ></audio>

        <button
          onClick={() => {
            console.log("next");
          }}
          className={`text-white rounded-lg transition-all h-12 w-[8rem] font-extrabold tracking-wide ${
            isValidRecording
              ? "bg-primary"
              : "bg-gray-600 text-gray-400 pointer-events-none"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
