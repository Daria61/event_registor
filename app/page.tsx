"use client";

import Image from "next/image";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import { EventInfo } from "@/components/EventInfo";

export type ScheduleMap = Record<string, string[]>;

const registrationSchema = z.object({
  date: z.string().min(1),
  time: z.string().min(1),
  seat: z.number().min(1, "Суудал сонгоно уу"),
  email: z.string().email("Имэйл буруу байна"),
  phone: z.string().min(5, "Утасны дугаарыг оруулна уу"),
});

export default function Home() {
  const [takenSeats, setTakenSeats] = useState<number[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectOptions, setSelectOptions] = useState<ScheduleMap>({});
  const [totalSeats, setTotalSeats] = useState(0);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);

  const requestIdRef = useRef(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      date: "",
      time: "",
      seat: 0,
      email: "",
      phone: "",
    },
  });

  const selectedDate = watch("date");
  const selectedTime = watch("time");
  const selectedSeat = watch("seat");

  // ---------------- Fetch seat status ----------------
  useEffect(() => {
    if (!selectedDate || !selectedTime) return;

    const fetchSeats = async () => {
      const requestId = ++requestIdRef.current;

      setFilterLoading(true);
      setTakenSeats([]);
      setValue("seat", 0);

      try {
        const res = await fetch(
          `/api/register?date=${selectedDate}&time=${selectedTime}`,
        );
        const data = await res.json();

        if (requestId !== requestIdRef.current) return;

        if (data.status === "success") {
          setTakenSeats(data.takenSeats);
          setCount(data.count);

          // If selected seat becomes invalid
          if (data.takenSeats.includes(selectedSeat)) {
            setValue("seat", 0);
          }
        } else {
          toast.error("Суудлын мэдээллийг авахад алдаа гарлаа");
        }
      } catch {
        toast.error("Суудлын мэдээллийг авахад алдаа гарлаа");
      } finally {
        if (requestId === requestIdRef.current) {
          setFilterLoading(false);
        }
      }
    };

    fetchSeats();
  }, [selectedDate, selectedTime]);

  // ---------------- Fetch schedule ----------------
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setFetchLoading(true);
        const res = await fetch("/api/schedule");
        const data = await res.json();

        if (data.status === "success") {
          setSelectOptions(data.schedule);
          setTotalSeats(data.total);
        } else {
          toast.error("Хуваарь авахад алдаа гарлаа");
        }
      } catch {
        toast.error("Хуваарь авахад алдаа гарлаа");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchOptions();
  }, []);

  // ---------------- Init date & time ----------------
  useEffect(() => {
    if (!Object.keys(selectOptions).length) return;

    const firstDate = Object.keys(selectOptions)[0];
    const firstTime = selectOptions[firstDate][0];

    setValue("date", firstDate);
    setValue("time", firstTime);
  }, [selectOptions]);

  // ---------------- Sync time with date ----------------
  useEffect(() => {
    const times = selectOptions[selectedDate];
    if (!times) return;

    if (!times.includes(selectedTime)) {
      setValue("time", times[0]);
    }
  }, [selectedDate, selectOptions]);

  // ---------------- Submit ----------------
  const onSubmit = async (data: z.infer<typeof registrationSchema>) => {
    try {
      setLoading(true);
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      result.status === "success"
        ? toast.success("Амжилттай бүртгэгдлээ 🎉")
        : toast.error(result.message);
    } catch {
      toast.error("Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="relative w-120 min-h-screen bg-black overflow-hidden">
        <div className="fixed top-0 left-1/2 -translate-x-1/2 h-90 w-120">
          <Image src="/Stoic.png" alt="poster" fill className="object-cover" />
        </div>

        <div className="relative z-10 mt-70 bg-white rounded-t-4xl px-4 py-6">
          <EventInfo
            totalSeats={totalSeats}
            count={count}
            schedule={selectOptions}
          />

          <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-4">
            {/* Date */}
            <p>Өдөр сонгох</p>
            <div className="flex gap-2 flex-wrap">
              {Object.keys(selectOptions).map((date) => (
                <Button
                  key={date}
                  type="button"
                  variant="outline"
                  className={selectedDate === date ? "bg-blue-500 text-white" : ""}
                  onClick={() => setValue("date", date)}
                >
                  {date}
                </Button>
              ))}
            </div>

            {/* Time */}
            <p>Цаг сонгох</p>
            <div className="flex gap-2">
              {(selectOptions[selectedDate] || []).map((time) => (
                <Button
                  key={time}
                  type="button"
                  variant="outline"
                  className={selectedTime === time ? "bg-blue-500 text-white" : ""}
                  onClick={() => setValue("time", time)}
                >
                  {time}
                </Button>
              ))}
            </div>

            {/* Seats */}
            <p>Суудал сонгох</p>
            <div className="grid grid-cols-6 gap-2">
              {filterLoading ? (
                <div className="col-span-6 flex justify-center py-6 h-42">
                  <div className="w-10 h-10 border-4 border-t-blue-500 rounded-full animate-spin" />
                </div>
              ) : (
                Array.from({ length: 20 }).map((_, i) => {
                  const seat = i + 1;
                  const taken = takenSeats.includes(seat);

                  return (
                    <Button
                      key={seat}
                      type="button"
                      disabled={taken}
                      variant="outline"
                      className={`${taken && "bg-gray-300"} ${
                        selectedSeat === seat && "bg-blue-500 text-white"
                      }`}
                      onClick={() => setValue("seat", seat)}
                    >
                      {seat}
                    </Button>
                  );
                })
              )}
            </div>

            {/* Info */}
            <Input placeholder="Имэйл" {...register("email")} />
            <Input placeholder="Утас" {...register("phone")} />

            <Button disabled={loading} className="w-full bg-blue-500 text-white">
              {loading ? "Илгээж байна..." : "Бүртгүүлэх"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
