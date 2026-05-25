"use client";
import { Select } from "antd";
import { Users } from "lucide-react";

export function SeatsPicker({
  value,
  onChange,
  max = 6,
  className,
  size = "large",
}: {
  value: number;
  onChange: (n: number) => void;
  max?: number;
  className?: string;
  size?: "middle" | "large";
}) {
  const opts = Array.from({ length: max }, (_, i) => {
    const n = i + 1;
    return {
      value: n,
      label: (
        <span className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-brand-600" />
          <span>
            {n} seat{n > 1 ? "s" : ""}
          </span>
        </span>
      ),
    };
  });

  return (
    <Select
      size={size}
      value={value}
      onChange={onChange}
      options={opts}
      className={className}
      style={{ width: "100%", minWidth: 120 }}
      popupMatchSelectWidth={150}
      variant="outlined"
      virtual={false}
      listHeight={320}
    />
  );
}
