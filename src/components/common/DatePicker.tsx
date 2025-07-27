"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !isNaN(date.getTime());
}

export interface DatePickerProps {
  value?: string | Date;
  onChange?: (date: string) => void;
  label?: string;
  name?: string;
  required?: boolean;
}

const parseDate = (val?: string | Date) => {
  if (!val) return undefined;
  if (val instanceof Date) return val;
  // Try to parse yyyy-mm-dd
  const d = new Date(val);
  return isNaN(d.getTime()) ? undefined : d;
};

const toISODate = (date: Date | undefined) => {
  if (!date) return "";
  return date.toISOString().slice(0, 10); // yyyy-mm-dd
};

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label = "Date",
  name = "date",
  required = false,
}) => {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(parseDate(value));
  const [month, setMonth] = React.useState<Date | undefined>(date);
  const [inputValue, setInputValue] = React.useState(
    value ? (typeof value === "string" ? value : toISODate(value)) : ""
  );

  React.useEffect(() => {
    setDate(parseDate(value));
    setInputValue(
      value ? (typeof value === "string" ? value : toISODate(value)) : ""
    );
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    const d = new Date(e.target.value);
    if (isValidDate(d)) {
      setDate(d);
      setMonth(d);
      onChange && onChange(toISODate(d));
    }
  };

  const handleSelect = (d?: Date) => {
    setDate(d);
    setInputValue(toISODate(d));
    setOpen(false);
    if (d && onChange) onChange(toISODate(d));
  };

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={name} className="px-1">
        {label}
      </Label>
      <div className="relative flex gap-2">
        <Input
          id={name}
          name={name}
          value={inputValue}
          placeholder="yyyy-mm-dd"
          className="bg-background pr-10"
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
            }
          }}
          required={required}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date-picker"
              variant="ghost"
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
              tabIndex={-1}
              type="button"
            >
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="end"
            alignOffset={-8}
            sideOffset={10}
          >
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              month={month}
              onMonthChange={setMonth}
              onSelect={handleSelect}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default DatePicker;
