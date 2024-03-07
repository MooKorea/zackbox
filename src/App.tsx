import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Player from "./pages/Player";
import Host from "./pages/Host";
import FaceDetection from "./pages/Player/FaceDetection";
import UnityControls from "./pages/Player/UnityControls";
import { AppContextProvider } from "./Contexts";

declare global {
  interface Window {
    WebFunction: any;
    CreateGameQRCode: any;
    FaceTrack: boolean;
    IsAudioRecord: boolean;
  }
}

window.IsAudioRecord = false;

const PageNotFound = (
  <div className="w-screen h-screen flex-col flex justify-center items-center">
    <h1>404</h1>
    <h2>Page not found</h2>
  </div>
);

const router = createBrowserRouter([
  { path: "/", Component: Player, errorElement: PageNotFound },
  { path: "/photo", Component: FaceDetection },
  { path: "/controls", Component: UnityControls },
  { path: "/game", Component: Host },
]);

export default function App() {
  return (
    <AppContextProvider>
      <RouterProvider router={router} />;
    </AppContextProvider>
  );
}
