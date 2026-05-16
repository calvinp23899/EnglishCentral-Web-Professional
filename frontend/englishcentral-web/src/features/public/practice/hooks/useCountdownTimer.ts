import { useEffect, useMemo, useState } from "react";

type UseCountdownTimerOptions = {
  minutes: number;
  enabled?: boolean;
  onTimeUp?: () => void;
};

export function useCountdownTimer({
  minutes,
  enabled = true,
  onTimeUp,
}: UseCountdownTimerOptions) {
  const initialSeconds = minutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    if (!enabled) return;

    const timerId = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timerId);
          onTimeUp?.();
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [enabled, onTimeUp]);

  const formattedTime = useMemo(() => {
    const minutesLeft = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;

    return `${String(minutesLeft).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  }, [secondsLeft]);

  return {
    secondsLeft,
    formattedTime,
    isTimeUp: secondsLeft === 0,
  };
}