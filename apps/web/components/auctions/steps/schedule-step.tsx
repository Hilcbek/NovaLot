// features/auctions/components/steps/schedule-step.tsx
"use client";

import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Controller, useFormContext } from "react-hook-form";
import { AuctionFormValues } from "../form-types";

function DateTimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Date | undefined;
  onChange: (date: Date) => void;
}) {
  const timeValue = value ? format(value, "HH:mm") : "12:00";

  function handleDateSelect(date: Date | undefined) {
    if (!date) return;
    const [hours, minutes] = timeValue.split(":").map(Number);
    const merged = new Date(date);
    merged.setHours(hours, minutes);
    onChange(merged);
  }

  function handleTimeChange(time: string) {
    const base = value ?? new Date();
    const [hours, minutes] = time.split(":").map(Number);
    const merged = new Date(base);
    merged.setHours(hours, minutes);
    onChange(merged);
  }

  return (
    <div className="flex flex-col gap-2">
      <FieldLabel>{label}</FieldLabel>
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex-1 justify-start font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? format(value, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={value} onSelect={handleDateSelect} />
          </PopoverContent>
        </Popover>
        <Input
          type="time"
          className="w-32"
          value={timeValue}
          onChange={(e) => handleTimeChange(e.target.value)}
        />
      </div>
    </div>
  );
}

export function ScheduleStep() {
  const {
    control,
    formState: { errors },
  } = useFormContext<AuctionFormValues>();

  return (
    <FieldGroup>
      <Controller
        control={control}
        name="startTime"
        render={({ field }) => (
          <Field data-invalid={!!errors.startTime}>
            <DateTimeField label="Start" value={field.value} onChange={field.onChange} />
            {errors.startTime && <FieldError>{errors.startTime.message}</FieldError>}
          </Field>
        )}
      />

      <Controller
        control={control}
        name="endTime"
        render={({ field }) => (
          <Field data-invalid={!!errors.endTime}>
            <DateTimeField label="End" value={field.value} onChange={field.onChange} />
            {errors.endTime && <FieldError>{errors.endTime.message}</FieldError>}
          </Field>
        )}
      />
    </FieldGroup>
  );
}