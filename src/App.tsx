import { Routes, Route } from "react-router-dom";
import Player from "./pages/Player";
import Host from "./pages/Host";
import FaceDetection from "./pages/Player/FaceDetection";
import RecordVoice from "./pages/Player/RecordVoice";

declare global {
  interface Window {
    WebFunction: any;
    CreateGameQRCode: any;
    FaceTrack: boolean;
    IsAudioRecord: boolean;
  }
}

window.IsAudioRecord = false;

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Player />} />
      <Route path="/photo" element={<FaceDetection />} />
      <Route path="/voice" element={<RecordVoice />} />
      <Route path="/game" element={<Host />} />
    </Routes>
  );
}
