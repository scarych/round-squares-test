import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface ICurrentTime {
  now: Date;
  startClock: () => void;
}

export const useCurrentTime = create<ICurrentTime>()(
  devtools((set) => {
    let interval: NodeJS.Timeout;

    return {
      now: new Date(),
      startClock() {
        clearInterval(interval);
        interval = setInterval(() => {
          set({ now: new Date() });
        }, 1000);
      },
    };
  })
);
