"use client";

import { useState, useTransition } from "react";

type ToolToggleButtonProps = {
  toolId: string;       // unique id of the tool
  initialOn: boolean;   // current ON/OFF state from the server
};

export default function ToolToggleButton({ toolId, initialOn }: ToolToggleButtonProps) {
  const [isOn, setIsOn] = useState(initialOn);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    const next = !isOn;

    // Instantly update how the button looks
    setIsOn(next);

    // Tell your backend about the change
    startTransition(async () => {
      try {
        await fetch("/api/tools/toggle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: toolId, enabled: next }),
        });
      } catch (error) {
        console.error("Failed to toggle tool", error);
        // Optional: revert UI if request fails
        // setIsOn(!next);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={
        "px-3 py-1 rounded text-sm font-medium " +
        (isOn ? "bg-green-500 text-white" : "bg-gray-700 text-gray-200")
      }
    >
      {isOn ? "ON" : "OFF"}
    </button>
  );
}
