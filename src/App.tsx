import { Routes, Route } from "react-router-dom";
import Player from "./pages/Player";
import Host from "./pages/Host"

declare global {
  interface Window {
    WebFunction: any;
    CreateGameQRCode: any;
    CancelFaceTrack: boolean;
  }
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Player />} />
      <Route path="/game" element={<Host />} />
    </Routes>
  );
}
