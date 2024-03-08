import { useCallback, useEffect, useState } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import RecordVoice from "./RecordVoice";
import { useAppContext } from "../../Contexts";
import { useNavigate } from "react-router-dom";
import { ReactUnityEventParameter } from "react-unity-webgl/distribution/types/react-unity-event-parameters";
import { db } from "../../firebase";
import { ref, set, remove } from "firebase/database";
import { storage } from "../../firebase";
import { ref as sRef, uploadBytes } from "firebase/storage";

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
  const game = useUnityContext({
    loaderUrl: "./Player/Build/Player.loader.js",
    dataUrl: "./Player/Build/Player.data.br",
    frameworkUrl: "./Player/Build/Player.framework.js.br",
    codeUrl: "./Player/Build/Player.wasm.br",
  });
  const data = useAppContext();
  const navigate = useNavigate();
  const [playerId, setPlayerId] = useState(0);
  const handleRemoveData = () => {
    const playerRef = ref(db, `games/on60/${playerId}`);
    remove(playerRef);
  };

  useEffect(() => {
    if (data.code === "") {
      navigate("/");
    }

    window.addEventListener("unload", handleRemoveData);
    return () => {
      window.removeEventListener("unload", handleRemoveData);
      handleRemoveData();
    };
  }, []);

  const handleSendData = useCallback(
    (...parameters: ReactUnityEventParameter[]) => {
      const playerId = Date.now();
      setPlayerId(playerId);
      if (data.photoBlob !== null) {
        uploadBytes(
          sRef(storage, `games/on60/${playerId}/photo`),
          data.photoBlob
        );
      }
      
      console.log(data.voiceBlob)
      if (data.voiceBlob !== null) {
        uploadBytes(
          sRef(storage, `games/on60/${playerId}/voice`),
          data.voiceBlob
        );
      }

      const playerRef = ref(db, `games/on60/${playerId}`);
      set(playerRef, {
        id: playerId,
        name: parameters[0],
        hairIndex: parameters[1],
        hairCol: parameters[2],
        shirtCol: parameters[3],
        pantsCol: parameters[4],
        skinColor: data.skinColor,
      });
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
