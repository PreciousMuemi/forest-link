import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PitchDeck } from "@/components/PitchDeck";

export default function PitchDeckPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        navigate("/");
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [navigate]);

  return <PitchDeck />;
}
