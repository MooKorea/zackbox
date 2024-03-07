import { useEffect, useState } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import RecordVoice from "./RecordVoice";
import { useAppContext } from "../../Contexts";

export default function UnityControls() {
  const [voiceSubmitted, setVoiceSubmitted] = useState(false);

  return (
    <>
      {!voiceSubmitted && <RecordVoice setVoiceSubmitted={setVoiceSubmitted} />}
      <UnityPlayer className={voiceSubmitted ? "block" : "hidden"} />
    </>
  );
}

type UnityPlayer = React.HTMLAttributes<HTMLDivElement>;

function UnityPlayer({ ...props }: UnityPlayer) {
  const { unityProvider, isLoaded, sendMessage } = useUnityContext({
    loaderUrl: "./Player/Build/Player.loader.js",
    dataUrl: "./Player/Build/Player.data.br",
    frameworkUrl: "./Player/Build/Player.framework.js.br",
    codeUrl: "./Player/Build/Player.wasm.br",
  });

  useEffect(() => {
    window.WebFunction = function () {
      console.log("working");
    };
  }, []);

  const { faceDataURL, voiceDataURL, skinColor } = useAppContext();
  useEffect(() => {
    if (!isLoaded) return;
    if (faceDataURL != "") {
      sendMessage("Zii", "LoadFace", faceDataURL);
      sendMessage("Zii", "LoadSkinColor", skinColor)
    }

    if (voiceDataURL != "") {
      console.log("data sent")
      sendMessage("Zii", "LoadVoice", voiceDataURL);
    }
  }, [isLoaded, faceDataURL, voiceDataURL, skinColor]);

  return (
    <div className={props.className}>
      <Unity unityProvider={unityProvider} className="w-full h-full absolute top-0" />
    </div>
  );
}
