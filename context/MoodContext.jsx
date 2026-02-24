import { createContext, useContext, useState, useEffect } from "react";
import { getMoods, saveMood, deleteMood } from "../utils/storage";

const MoodContext = createContext(null);

export function MoodProvider({ children }) {
  const [moods, setMoods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMoods = async () => {
    setIsLoading(true);
    const data = await getMoods();
    setMoods(data);
    setIsLoading(false);
  };

  //load data dari storage saat app pertama dibuka
  useEffect(() => {
    loadMoods();
  }, []);

  const addMood = async (moodEntry) => {
    const updated = await saveMood(moodEntry);
    setMoods(updated);
  };

  const removeMood = async (id) => {
    const updated = await deleteMood(id);
    setMoods(updated);
  };

  const value = {
    moods,
    isLoading,
    addMood,
    removeMood,
  };

  return <MoodContext.Provider value={value}>{children}</MoodContext.Provider>;
}

// Custom hook agar lebih mudah dipakai
// Dapada import useContext & MoodContext disetiap file
// cukup import useMood saja
export function useMood() {
  const context = useContext(MoodContext);
  if (!context) {
    throw new Error("useMood harus dipakai di dalam MoodProvider");
  }
  return context;
}
