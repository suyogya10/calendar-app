"use client";

import React, { useState } from "react";
import { addMonths, addWeeks, addDays, subMonths, subWeeks, subDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import CalendarHeader from "./CalendarHeader";
import MonthView from "./MonthView";
import WeekView from "./WeekView";
import DayView from "./DayView";
import { EventModal } from "./EventModal";
import { DayDetailsModal } from "./DayDetailsModal";
import { useConfig, ApiEvent, ApiHoliday } from "@/context/ConfigContext";
import NepaliDate from "nepali-datetime";

type ViewType = "month" | "week" | "day";

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>("month");
  const [direction, setDirection] = useState(0);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isDayDetailsOpen, setIsDayDetailsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<ApiEvent | ApiHoliday | null>(null);
  const { calendarMode } = useConfig();

  const openDayDetails = (date: Date) => {
    setSelectedDate(date);
    setIsDayDetailsOpen(true);
  };

  const openEventModal = (date: Date, time?: string, event?: ApiEvent | ApiHoliday) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setSelectedEvent(event || null);
    setIsDayDetailsOpen(false);
    setIsEventModalOpen(true);
  };

  const next = () => {
    setDirection(1);
    if (view === "month") {
      if (calendarMode === "BS") {
        const nd = new NepaliDate(currentDate);
        let m = nd.getMonth() + 1;
        let y = nd.getYear();
        if (m > 11) { m = 0; y++; }
        // Set to 15th of the month to avoid any edge cases with month lengths during transition
        setCurrentDate(new NepaliDate(y, m, 15).getDateObject());
      } else {
        setCurrentDate(addMonths(currentDate, 1));
      }
    }
    else if (view === "week") setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const prev = () => {
    setDirection(-1);
    if (view === "month") {
      if (calendarMode === "BS") {
        const nd = new NepaliDate(currentDate);
        let m = nd.getMonth() - 1;
        let y = nd.getYear();
        if (m < 0) { m = 11; y--; }
        setCurrentDate(new NepaliDate(y, m, 15).getDateObject());
      } else {
        setCurrentDate(subMonths(currentDate, 1));
      }
    }
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
    delta: 50,
    preventScrollOnSwipe: false,
    trackMouse: true,
  });

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : direction < 0 ? -100 : 0,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : direction > 0 ? -100 : 0,
      opacity: 0
    })
  };

  return (
    <div className="flex-1 flex flex-col w-full bg-background font-sans selection:bg-primary/20 selection:text-primary">
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        setView={setView}
        onNext={next}
        onPrev={prev}
        onToday={today}
        onAddEvent={() => openEventModal(currentDate)}
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
            {view === "month" && <MonthView currentDate={currentDate} onDateClick={(d) => openDayDetails(d)} />}
            {view === "week" && <WeekView currentDate={currentDate} onSlotClick={(d, t) => openEventModal(d, t)} />}
            {view === "day" && <DayView currentDate={currentDate} onSlotClick={(d, t) => openEventModal(d, t)} />}
          </motion.div>
        </AnimatePresence>
      </main>


      
      <EventModal 
        isOpen={isEventModalOpen} 
        onClose={() => {
          setIsEventModalOpen(false);
          setSelectedEvent(null);
        }} 
        selectedDate={selectedDate}
        initialTime={selectedTime}
        eventToEdit={selectedEvent}
      />

      <DayDetailsModal
        isOpen={isDayDetailsOpen}
        onClose={() => setIsDayDetailsOpen(false)}
        selectedDate={selectedDate}
        onAddEvent={(d) => openEventModal(d)}
        onEditEvent={(d, e) => openEventModal(d, undefined, e)}
      />
    </div>
  );
};

export default Calendar;
