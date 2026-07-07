import React, { useState, useEffect } from 'react';

export default function CurrentTimeIndicator({ rowHeight, calendarStart = 0 }) {
  const [offset, setOffset] = useState(-10);

  useEffect(() => {
    const calcOffset = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const currentH = h + m / 60;
      if (currentH >= calendarStart && currentH <= calendarStart + 24) {
        setOffset((currentH - calendarStart) * rowHeight);
      } else {
        setOffset(-10);
      }
    };

    calcOffset();
    const interval = setInterval(calcOffset, 60000);
    return () => clearInterval(interval);
  }, [rowHeight, calendarStart]);

  if (offset < 0) return null;

  return (
    <div
      className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
      style={{ top: `${offset}px` }}
    >
      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 -ml-[4px]" />
      <div className="flex-1 h-[1px] bg-amber-500" />
    </div>
  );
}
