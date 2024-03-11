import { useCallback, useEffect, useState } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import RecordVoice from "./RecordVoice";
import { useAppContext } from "../../Contexts";
import { useNavigate } from "react-router-dom";
import { ReactUnityEventParameter } from "react-unity-webgl/distribution/types/react-unity-event-parameters";
import { db } from "../../firebase";
import { ref, set, remove, onDisconnect } from "firebase/database";
import { storage } from "../../firebase";
import { ref as sRef, uploadBytes, getDownloadURL } from "firebase/storage";

export default function UnityControls() {
  const [voiceSubmitted, setVoiceSubmitted] = useState(false);

  return (
    <>
      {!voiceSubmitted && <RecordVoice setVoiceSubmitted={setVoiceSubmitted} />}
      <UnityPlayer className={voiceSubmitted ? "block" : "hidden"} />
    </>
  );
}

type PlayerData = {
  id: number;
  hairIndex: number;
  hairCol: string;
  shirtCol: string;
  pantsCol: string;
  skinColor: string;
  name: string;
  faceTextureURL: string;
  voiceClipURL: string;
};

type UnityPlayer = React.HTMLAttributes<HTMLDivElement>;

function UnityPlayer({ ...props }: UnityPlayer) {
  const game = useUnityContext({
    loaderUrl: "./Player/Build/Player.loader.js",
    dataUrl: "./Player/Build/Player.data.br",
    frameworkUrl: "./Player/Build/Player.framework.js.br",
    codeUrl: "./Player/Build/Player.wasm.br",
  });
  const data = useAppContext();
  const navigate = useNavigate();
  const [playerId, setPlayerId] = useState(0);

  useEffect(() => {
    const playerId = Date.now();
    setPlayerId(playerId);

    if (data.code === "") {
      navigate("/");
    }

    const playerRef = ref(db, `games/on60/${playerId}`);
    onDisconnect(playerRef).remove();
  }, []);

  const getFileURLs = async (playerData: PlayerData) => {
    if (data.photoBlob !== null && data.voiceBlob !== null) {
      await Promise.all([
        uploadBytes(sRef(storage, `games/on60/${playerId}/photo`), data.photoBlob),
        uploadBytes(sRef(storage, `games/on60/${playerId}/voice`), data.voiceBlob),
      ]);
    }
    const [faceTextureURL, voiceClipURL] = await Promise.all([
      getDownloadURL(sRef(storage, `games/on60/${playerId}/photo`)),
      getDownloadURL(sRef(storage, `games/on60/${playerId}/voice`)),
    ]);
    playerData.faceTextureURL = faceTextureURL;
    playerData.voiceClipURL = voiceClipURL;

    const playerRef = ref(db, `games/on60/${playerId}`);
    set(playerRef, playerData);
    console.log(playerData);
    console.log(JSON.stringify(playerData))
  };

  const handleSendData = useCallback(
    (...parameters: ReactUnityEventParameter[]) => {
      const playerData: PlayerData = {
        id: playerId,
        hairIndex: parameters[0] as number,
        hairCol: parameters[1] as string,
        shirtCol: parameters[2] as string,
        pantsCol: parameters[3] as string,
        skinColor: data.skinColor,
        name: data.name,
        faceTextureURL: "",
        voiceClipURL: "",
      };

      getFileURLs(playerData);
    },
    [data.voiceBlob]
  );

  useEffect(() => {
    game.addEventListener("SendPlayerAppearanceData", handleSendData);
    return () => {
      game.removeEventListener("SendPlayerAppearanceData", handleSendData);
    };
  }, [addEventListener, removeEventListener, handleSendData]);

  useEffect(() => {
    if (!game.isLoaded) return;
    if (data.photoBlob != null) {
      const reader = new FileReader();
      reader.readAsDataURL(data.photoBlob);
      reader.onloadend = () => {
        game.sendMessage("Zii", "LoadFace", reader.result as string);
      };
      game.sendMessage("Zii", "LoadSkinColor", data.skinColor);
    }

    if (data.voiceDataURL != "") {
      game.sendMessage("Zii", "LoadVoice", data.voiceDataURL);
    }
  }, [game.isLoaded, data]);

  return (
    <div className={props.className}>
      <Unity
        unityProvider={game.unityProvider}
        className="w-full h-full absolute top-0"
      />
    </div>
  );
}
