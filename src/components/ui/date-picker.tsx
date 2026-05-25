"use client";
import { DatePicker as AntDatePicker, TimePicker as AntTimePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { Calendar, Clock } from "lucide-react";

type Props = {
  value?: string;
  onChange: (iso: string) => void;
  min?: string;
  placeholder?: string;
  className?: string;
  size?: "middle" | "large";
};

export function DatePicker({
  value,
  onChange,
  min,
  placeholder = "Pick a date",
  className,
  size = "large",
}: Props) {
  const v = value ? dayjs(value) : null;
  const minDay = min ? dayjs(min).startOf("day") : null;

  return (
    <AntDatePicker
      size={size}
      value={v}
      placeholder={placeholder}
      format="ddd, DD MMM YYYY"
      className={className}
      style={{ width: "100%" }}
      suffixIcon={<Calendar className="h-4 w-4 text-muted-foreground" />}
      disabledDate={(d: Dayjs) =>
        minDay ? d && d.isBefore(minDay) : false
      }
      onChange={(d) => onChange(d ? d.format("YYYY-MM-DD") : "")}
      allowClear={false}
      inputReadOnly
    />
  );
}

export function TimePicker({
  value,
  onChange,
  className,
  size = "large",
}: {
  value: string;
  onChange: (hhmm: string) => void;
  className?: string;
  size?: "middle" | "large";
}) {
  const v = value ? dayjs(value, "HH:mm") : null;
  return (
    <AntTimePicker
      size={size}
      value={v}
      format="hh:mm A"
      minuteStep={5}
      use12Hours
      className={className}
      style={{ width: "100%" }}
      suffixIcon={<Clock className="h-4 w-4 text-muted-foreground" />}
      onChange={(d) => onChange(d ? d.format("HH:mm") : "")}
      allowClear={false}
      inputReadOnly
    />
  );
}
