import { useCallback, useEffect, useState } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import RecordVoice from "./RecordVoice";
import { useAppContext } from "../../Contexts";
import { useNavigate } from "react-router-dom";
import { ReactUnityEventParameter } from "react-unity-webgl/distribution/types/react-unity-event-parameters";
import { db } from "../../firebase";
import { ref, set } from "firebase/database";
import { storage } from "../../firebase";
import { ref as sRef, uploadString } from "firebase/storage";

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
  const { unityProvider, isLoaded, sendMessage, addEventListener, removeEventListener } =
    useUnityContext({
      loaderUrl: "./Player/Build/Player.loader.js",
      dataUrl: "./Player/Build/Player.data.br",
      frameworkUrl: "./Player/Build/Player.framework.js.br",
      codeUrl: "./Player/Build/Player.wasm.br",
    });
  const { faceDataURL, voiceDataURL, skinColor, code } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (import.meta.env.MODE === "development") return;

    if (code === "") {
      navigate("/");
    }
  }, []);

  const handleSendData = useCallback((...parameters: ReactUnityEventParameter[]) => {
    const playerId = Date.now();
    uploadString(sRef(storage, `games/on60/${playerId}/photo`), faceDataURL, 'data_url')
    uploadString(sRef(storage, `games/on60/${playerId}/voice`), voiceDataURL, 'data_url')

    const gameRef = ref(db, `games/on60/${playerId}`);
    set(gameRef, {
      name: parameters[0],
      hairIndex: parameters[1],
      hairCol: parameters[2],
      shirtCol: parameters[3],
      pantsCol: parameters[4],
    });
  }, []);

  useEffect(() => {
    addEventListener("SendPlayerAppearanceData", handleSendData);
    return () => {
      removeEventListener("SendPlayerAppearanceData", handleSendData);
    };
  }, [addEventListener, removeEventListener, handleSendData]);

  useEffect(() => {
    if (!isLoaded) return;
    if (faceDataURL != "") {
      sendMessage("Zii", "LoadFace", faceDataURL);
      sendMessage("Zii", "LoadSkinColor", skinColor);
    }

    if (voiceDataURL != "") {
      sendMessage("Zii", "LoadVoice", voiceDataURL);
    }
  }, [isLoaded, faceDataURL, voiceDataURL, skinColor]);

  return (
    <div className={props.className}>
      <Unity unityProvider={unityProvider} className="w-full h-full absolute top-0" />
    </div>
  );
}
