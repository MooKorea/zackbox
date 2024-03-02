import { useEffect } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";

declare global {
  interface Window {
    WebFunction: any;
  }
}

window.WebFunction = function () {
  console.log("unity function call");
};

export default function App() {
  const { unityProvider, isLoaded, sendMessage } = useUnityContext({
    loaderUrl: "./Build/public.loader.js",
    dataUrl: "./Build/public.data.br",
    frameworkUrl: "./Build/public.framework.js.br",
    codeUrl: "./Build/public.wasm.br",
  });

  useEffect(() => {
    if (isLoaded) {
      sendMessage("ControlTest", "Test");
    }
  }, [isLoaded])

  return <Unity unityProvider={unityProvider} style={{ width: "100vw", height: "100vh" }} />;
}
