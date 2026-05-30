"use client";

import PhoneInput from "react-phone-number-input";
import es from "react-phone-number-input/locale/es.json";
import "react-phone-number-input/style.css";

type PhoneFieldProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
};

export function PhoneField({ value, onChange, disabled, id, className }: PhoneFieldProps) {
  return (
    <PhoneInput
      id={id}
      international
      defaultCountry="CO"
      labels={es}
      countryCallingCodeEditable={false}
      value={value}
      onChange={(next) => onChange(next ?? "")}
      disabled={disabled}
      className={`phone-field-root ${className ?? ""}`}
      numberInputProps={{
        className:
          "w-full rounded-xl border border-outline-variant/30 bg-white px-4 py-3 text-sm outline-none focus:border-primary",
      }}
    />
  );
}
