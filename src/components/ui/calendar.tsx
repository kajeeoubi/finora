"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { id as localeId } from "date-fns/locale";
import { ChevronLeft, ChevronRight, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

const INDONESIAN_MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const YEARS = Array.from({ length: 15 }, (_, i) => 2020 + i); // 2020 to 2034

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  month: controlledMonth,
  onMonthChange,
  ...props
}: CalendarProps) {
  const [internalMonth, setInternalMonth] = React.useState<Date>(
    controlledMonth || new Date()
  );

  const currentMonthDate = controlledMonth || internalMonth;

  const handleMonthChange = (newDate: Date) => {
    setInternalMonth(newDate);
    if (onMonthChange) {
      onMonthChange(newDate);
    }
  };

  const handleSelectMonth = (monthIndex: number) => {
    const nextDate = new Date(currentMonthDate);
    nextDate.setMonth(monthIndex);
    handleMonthChange(nextDate);
  };

  const handleSelectYear = (year: number) => {
    const nextDate = new Date(currentMonthDate);
    nextDate.setFullYear(year);
    handleMonthChange(nextDate);
  };

  const handlePrevMonth = () => {
    const nextDate = new Date(currentMonthDate);
    nextDate.setMonth(nextDate.getMonth() - 1);
    handleMonthChange(nextDate);
  };

  const handleNextMonth = () => {
    const nextDate = new Date(currentMonthDate);
    nextDate.setMonth(nextDate.getMonth() + 1);
    handleMonthChange(nextDate);
  };

  const currentMonthIdx = currentMonthDate.getMonth();
  const currentYear = currentMonthDate.getFullYear();

  return (
    <div className={cn("p-2 bg-white dark:bg-[#16161C] rounded-2xl space-y-2", className)}>
      {/* Custom Header with Month & Year Editable Dropdowns and Navigation Arrows */}
      <div className="flex items-center justify-between px-1 pt-1 pb-2 border-b border-black/[0.04] dark:border-white/[0.06]">
        {/* Previous Month Arrow */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handlePrevMonth}
              className="h-7 w-7 flex items-center justify-center rounded-lg border border-black/[0.08] dark:border-white/10 text-zinc-600 dark:text-zinc-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Bulan Sebelumnya
          </TooltipContent>
        </Tooltip>

        {/* Month & Year Selectors */}
        <div className="flex items-center gap-1.5">
          {/* Month Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="h-7 px-2.5 rounded-lg bg-[#F5F5F7] dark:bg-[#202028] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] border border-black/[0.04] dark:border-white/10 text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1 transition-colors cursor-pointer outline-none">
              <span>{INDONESIAN_MONTHS[currentMonthIdx]}</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="max-h-56 overflow-y-auto w-36 p-1 z-50">
              {INDONESIAN_MONTHS.map((mName, idx) => (
                <DropdownMenuItem
                  key={mName}
                  onClick={() => handleSelectMonth(idx)}
                  className="flex items-center justify-between text-xs py-1.5"
                >
                  <span className={cn(idx === currentMonthIdx && "font-bold text-[#6C4EF5]")}>
                    {mName}
                  </span>
                  {idx === currentMonthIdx && (
                    <Check className="h-3.5 w-3.5 text-[#6C4EF5]" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Year Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="h-7 px-2.5 rounded-lg bg-[#F5F5F7] dark:bg-[#202028] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] border border-black/[0.04] dark:border-white/10 text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1 transition-colors cursor-pointer outline-none">
              <span>{currentYear}</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="max-h-56 overflow-y-auto w-28 p-1 z-50">
              {YEARS.map((y) => (
                <DropdownMenuItem
                  key={y}
                  onClick={() => handleSelectYear(y)}
                  className="flex items-center justify-between text-xs py-1.5"
                >
                  <span className={cn(y === currentYear && "font-bold text-[#6C4EF5]")}>
                    {y}
                  </span>
                  {y === currentYear && (
                    <Check className="h-3.5 w-3.5 text-[#6C4EF5]" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Next Month Arrow */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleNextMonth}
              className="h-7 w-7 flex items-center justify-center rounded-lg border border-black/[0.08] dark:border-white/10 text-zinc-600 dark:text-zinc-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Bulan Berikutnya
          </TooltipContent>
        </Tooltip>
      </div>

      {/* DayPicker Grid */}
      <DayPicker
        locale={localeId}
        month={currentMonthDate}
        onMonthChange={handleMonthChange}
        showOutsideDays={showOutsideDays}
        className="p-0"
        classNames={{
          months: "flex flex-col sm:flex-row gap-4",
          month: "space-y-2",
          month_caption: "hidden",
          caption_label: "hidden",
          nav: "hidden",
          month_grid: "w-full border-collapse space-y-1",
          weekdays: "flex justify-between pb-1",
          weekday:
            "text-muted-foreground rounded-md w-8 font-semibold text-[11px] text-center uppercase",
          week: "flex w-full mt-1 justify-between",
          day: "h-8 w-8 text-center text-xs p-0 relative focus-within:relative focus-within:z-20",
          day_button: cn(
            buttonVariants({ variant: "ghost" }),
            "h-8 w-8 p-0 font-bold rounded-xl aria-selected:opacity-100 text-xs hover:bg-[#6C4EF5]/10 hover:text-[#6C4EF5] cursor-pointer"
          ),
          range_end: "day-range-end",
          selected:
            "bg-[#6C4EF5] text-white hover:bg-[#5638D6] hover:text-white focus:bg-[#6C4EF5] focus:text-white shadow-md shadow-violet-500/25 rounded-xl",
          today: "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white rounded-xl",
          outside:
            "text-muted-foreground opacity-30 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
          disabled: "text-muted-foreground opacity-30",
          range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          hidden: "invisible",
          ...classNames,
        }}
        {...props}
      />
    </div>
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
