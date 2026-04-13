import React, { useMemo, useState, useEffect } from 'react';
import './Timer.css';

interface TimerProps {
  elapsed: number; // milliseconds (from server)
  duration: number; // milliseconds (from server)
}

export default function Timer({ elapsed, duration }: TimerProps) {
  const [clientTime, setClientTime] = useState(0);

  // Track when we receive server updates
  useEffect(() => {
    // Set initial client time when server sends update
    const now = Date.now();
    setClientTime(elapsed);

    // Calculate local elapsed time for smooth updates
    let frameId: number;
    const updateTimer = () => {
      const localElapsed = elapsed + (Date.now() - now);
      setClientTime(Math.min(localElapsed, duration));
      frameId = requestAnimationFrame(updateTimer);
    };

    frameId = requestAnimationFrame(updateTimer);
    return () => cancelAnimationFrame(frameId);
  }, [elapsed, duration]);

  // Ensure we don't go negative
  const safeClientTime = Math.max(0, Math.min(clientTime, duration));
  const secondsRemaining = Math.max(0, Math.ceil((duration - safeClientTime) / 1000));

  const getTimerClass = useMemo(() => {
    if (secondsRemaining > 10) return 'timer-green';
    if (secondsRemaining > 0) return 'timer-yellow';
    return 'timer-red';
  }, [secondsRemaining]);

  const displayText = `${secondsRemaining}s`;

  return (
    <div className={`timer ${getTimerClass}`}>
      <div className="timer-display">{displayText}</div>
      <div className="timer-label">Time Remaining</div>
      <div className="timer-progress">
        <div
          className="progress-bar"
          style={{
            width: `${Math.min(100, (safeClientTime / duration) * 100)}%`,
          }}
        />
      </div>
    </div>
  );
}
