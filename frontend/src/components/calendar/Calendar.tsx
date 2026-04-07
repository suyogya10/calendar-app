"use client";

import React, { useState } from "react";
import { addMonths, addWeeks, addDays, subMonths, subWeeks, subDays } from "date-fns";
import CalendarHeader from "./CalendarHeader";
import CalendarBottomNav from "./CalendarBottomNav";
import MonthView from "./MonthView";
import WeekView from "./WeekView";
import DayView from "./DayView";

type ViewType = "month" | "week" | "day";

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>("month");

  const next = () => {
    if (view === "month") setCurrentDate(addMonths(currentDate, 1));
    else if (view === "week") setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const prev = () => {
    if (view === "month") setCurrentDate(subMonths(currentDate, 1));
    else if (view === "week") setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const today = () => setCurrentDate(new Date());

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
      
      <main className="flex-1 flex overflow-hidden w-full relative">
        <div className="flex-1 w-full overflow-hidden absolute inset-0">
          {view === "month" && <MonthView currentDate={currentDate} />}
          {view === "week" && <WeekView currentDate={currentDate} />}
          {view === "day" && <DayView currentDate={currentDate} />}
        </div>
      </main>

      <CalendarBottomNav view={view} setView={setView} />
    </div>
  );
};

export default Calendar;
