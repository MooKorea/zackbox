import { Routes, Route } from "react-router-dom";
import Player from "./pages/Player";
import Host from "./pages/Host"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Player />} />
      <Route path="/game" element={<Host />} />
    </Routes>
  );
}
