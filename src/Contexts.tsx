import { createContext, useContext, useState } from "react";

type AppContext = {
  faceDataURL: string;
  setFaceDataURL: React.Dispatch<React.SetStateAction<string>>;
  skinColor: string;
  setSkinColor: React.Dispatch<React.SetStateAction<string>>;
  voiceDataURL: string;
  setVoiceDataURL: React.Dispatch<React.SetStateAction<string>>;
};

const AppContext = createContext<AppContext | null>(null);

export const enum UIState {
  Home,
  Map
}

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const [faceDataURL, setFaceDataURL] = useState("");
  const [voiceDataURL, setVoiceDataURL] = useState("");
  const [skinColor, setSkinColor] = useState("")

  return (
    <AppContext.Provider
      value={{
        faceDataURL,
        setFaceDataURL,
        skinColor,
        setSkinColor,
        voiceDataURL,
        setVoiceDataURL,
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
