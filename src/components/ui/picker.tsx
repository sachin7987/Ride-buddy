"use client";
import { Select as AntSelect } from "antd";
import type { ReactNode } from "react";

export type PickerOption = {
  value: string | number;
  label: ReactNode;
  disabled?: boolean;
};

export function Picker({
  value,
  onChange,
  options,
  placeholder,
  className,
  size = "large",
  disabled,
}: {
  value: string | number | undefined;
  onChange: (v: any) => void;
  options: PickerOption[];
  placeholder?: string;
  className?: string;
  size?: "middle" | "large";
  disabled?: boolean;
}) {
  return (
    <AntSelect
      size={size}
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      style={{ width: "100%" }}
      virtual={options.length > 12}
      listHeight={320}
    />
  );
}
