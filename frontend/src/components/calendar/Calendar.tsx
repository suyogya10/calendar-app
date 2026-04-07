"use client";

import React, { useState } from "react";
import { addMonths, addWeeks, addDays, subMonths, subWeeks, subDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import CalendarHeader from "./CalendarHeader";
import CalendarBottomNav from "./CalendarBottomNav";
import MonthView from "./MonthView";
import WeekView from "./WeekView";
import DayView from "./DayView";

type ViewType = "month" | "week" | "day";

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>("month");
  const [direction, setDirection] = useState(0);

  const next = () => {
    setDirection(1);
    if (view === "month") setCurrentDate(addMonths(currentDate, 1));
    else if (view === "week") setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const prev = () => {
    setDirection(-1);
    if (view === "month") setCurrentDate(subMonths(currentDate, 1));
    else if (view === "week") setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const today = () => {
    setDirection(0);
    setCurrentDate(new Date());
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => next(),
    onSwipedRight: () => prev(),
    delta: 50, // require at least 50px swipe
    preventScrollOnSwipe: false,
    trackMouse: true, // Enables mouse dragging on desktop
  });

  const variants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 100 : direction < 0 ? -100 : 0,
        opacity: 0
      };
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 100 : direction > 0 ? -100 : 0,
        opacity: 0
      };
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full overflow-hidden bg-zinc-50 font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-20 md:pb-0">
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        setView={setView}
        onNext={next}
        onPrev={prev}
        onToday={today}
      />
      
      <main {...handlers} className="flex-1 flex overflow-hidden w-full relative">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentDate.toString() + view}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "tween", ease: "circOut", duration: 0.3 },
              opacity: { duration: 0.2 }
            }}
            className="flex-1 w-full h-full absolute inset-0"
          >
            {view === "month" && <MonthView currentDate={currentDate} />}
            {view === "week" && <WeekView currentDate={currentDate} />}
            {view === "day" && <DayView currentDate={currentDate} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <CalendarBottomNav view={view} setView={setView} />
    </div>
  );
};

export default Calendar;
