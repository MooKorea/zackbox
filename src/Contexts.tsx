import { createContext, useContext, useState } from "react";

type AppContext = {
  photoBlob: Blob | null;
  setPhotoBlob: React.Dispatch<React.SetStateAction<Blob | null>>;
  skinColor: string;
  setSkinColor: React.Dispatch<React.SetStateAction<string>>;
  voiceDataURL: string;
  setVoiceDataURL: React.Dispatch<React.SetStateAction<string>>;
  voiceBlob: Blob | null;
  setVoiceBlob: React.Dispatch<React.SetStateAction<Blob | null>>;
  code: string;
  setCode: React.Dispatch<React.SetStateAction<string>>;
};

const AppContext = createContext<AppContext | null>(null);

export const enum UIState {
  Home,
  Map,
}

export function AppContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [voiceDataURL, setVoiceDataURL] = useState("");
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [skinColor, setSkinColor] = useState("");
  const [code, setCode] = useState("");

  return (
    <AppContext.Provider
      value={{
        photoBlob,
        setPhotoBlob,
        skinColor,
        setSkinColor,
        voiceDataURL,
        setVoiceDataURL,
        voiceBlob,
        setVoiceBlob,
        code,
        setCode
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within a AppContextProvider");
  }
  return context;
}
