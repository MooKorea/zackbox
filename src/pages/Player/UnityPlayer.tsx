import { useEffect } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";

declare global {
  interface Window {
    WebFunction: any;
  }
}

interface UnityPlayer {
  setIsCanvas: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function UnityPlayer({ setIsCanvas }: UnityPlayer) {
  const { unityProvider, isLoaded, sendMessage } = useUnityContext({
    loaderUrl: "./Player/Build/public.loader.js",
    dataUrl: "./Player/Build/public.data.br",
    frameworkUrl: "./Player/Build/public.framework.js.br",
    codeUrl: "./Player/Build/public.wasm.br",
  });

  useEffect(() => {
    window.WebFunction = function () {
      setIsCanvas(false)
    };
  }, []);

  useEffect(() => {
    if (isLoaded) {
      sendMessage("ControlTest", "Test");
    }
  }, [isLoaded]);

  return (
    <Unity unityProvider={unityProvider} className="w-full h-full absolute top-0" />
  );
}
