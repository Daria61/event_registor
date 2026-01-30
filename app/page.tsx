"use client";

import Image from "next/image";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { EventInfo } from "@/components/EventInfo";

export type ScheduleMap = Record<string, string[]>;

export const registrationSchema = z.object({
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
  const [totalSeats, setTotalSeats] = useState(0)
  const [fetchLoading, setFetchLoading] = useState(false)
  const [filterLoading, setFilterLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      time: "12:00",
      seat: 0,
      email: "",
      phone: "",
      date: "0",
    },
  });

  const selectedTime = watch("time"); // track selected time
  const selectedSeat = watch("seat"); // track selected seat
  const selectedDate = watch("date"); // track selected date

  const onSubmit = async (data: z.infer<typeof registrationSchema>) => {
    try {
      setLoading(true);
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.status === "success") {
        toast.success("Амжилттай бүртгэгдлээ 🎉");
      } else {
        toast.error("Алдаа гарлаа: " + result.message);
      }
    } catch (err) {
      toast.error("Алдаа гарлаа");
    } finally {
      setLoading(false); // <-- stop loading
    }
  };

  useEffect(() => {
    if (!selectedTime) return;

    const fetchTakenSeats = async () => {
      try {
setFilterLoading(true)

        const res = await fetch(
          `/api/register?date=${selectedDate}&time=${selectedTime}`,
        );
        const data = await res.json();
        if (data.status === "success") {
          setTakenSeats(data.takenSeats);
          setCount(data.count);
          // Reset seat if currently selected seat is taken
          // if (data.takenSeats.includes(selectedSeat)) setValue("seat", 0);
        } else {
          toast.error("Суудлын мэдээллийг авахад алдаа гарлаа");
        }
      } catch (err) {
        toast.error("Суудлын мэдээллийг авахад алдаа гарлаа");
      } finally{
        setFilterLoading(false)
      }
    };

    fetchTakenSeats();
  }, [selectedTime, selectedDate]);

  useEffect(() => {
    setValue("seat", 0);
  }, [selectedDate, selectedTime]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setFetchLoading(true);
        const res = await fetch(`/api/schedule`);
        const data = await res.json();
        if (data.status === "success") {
          setSelectOptions(data.schedule);
          setTotalSeats(data.total)
        } else {
          toast.error("Суудлын мэдээллийг авахад алдаа гарлаа");
        }
      } catch (err) {
        toast.error("Суудлын мэдээллийг авахад алдаа гарлаа");
      } finally {
        setFetchLoading(false);
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    if (!selectOptions || Object.keys(selectOptions).length === 0) return;

    const firstDate = Object.keys(selectOptions)[0];
    const firstTime = selectOptions[firstDate][0];

    setValue("date", firstDate);
    setValue("time", firstTime);
  }, [selectOptions]);


  useEffect(() => {
  const times = selectOptions[selectedDate];
  if (!times) return;

  if (!times.includes(selectedTime)) {
    setValue("time", times[0]);
  }
}, [selectedDate, selectOptions]);

  if(fetchLoading) return <div className="flex min-h-screen items-center justify-center bg-white">Loading...</div>

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="relative w-120 min-h-screen bg-black overflow-hidden">
        {/* Fixed background image – centered */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 h-90 w-120 z-0">
          <Image
            src="/Stoic.png"
            alt="poster"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Scrollable content */}
        <div className="relative z-10 mt-70 rounded-t-4xl bg-white min-h-screen overflow-y-auto px-4 py-6">
          <p className="font-semibold mb-3 text-xl">
            Нээлттэй өдөрлөг мэдээлэл
          </p>
         <EventInfo totalSeats={totalSeats} count={count} schedule={selectOptions}/>

          <div className="mt-10">
            <p className="font-semibold my-3 text-xl">Бүртгүүлэх</p>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <p>Өдөр сонгох</p>
              <div className="flex gap-4 flex-wrap">
                {Object.keys(selectOptions).map((date) => (
                  <Button
                    key={date}
                    type="button"
                    variant="outline"
                    className={`px-4 py-2 ${
                      selectedDate === date ? "bg-blue-500 text-white" : ""
                    }`}
                    onClick={() => setValue("date", date)}
                  >
                    {date}
                  </Button>
                ))}
              </div>
              {/* Time selection */}
              <p>Цаг сонгох</p>
              <div className="flex gap-4">
                {(selectOptions[selectedDate] || []).map((time) => (
                  <Button
                    key={time}
                    type="button"
                    variant="outline"
                    className={`px-4 py-2 ${
                      selectedTime === time ? "bg-blue-500 text-white" : ""
                    }`}
                    onClick={() => setValue("time", time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
              {errors.time && (
                <p className="text-red-500 text-sm">{errors.time.message}</p>
              )}

              {/* Seat selection */}
              <p>Суудал сонгох</p>
              <div className="grid grid-cols-6 gap-2">
                {filterLoading &&  
             <div className="w-full h-42 flex justify-center">   <div className="w-12 h-12 border-8 border-t-blue-500 border-gray-200 rounded-full animate-spin self-center"></div> </div> 
                }
                { !filterLoading && Array.from({ length: 20 }).map((_, ind) => {
                  const seatNum = ind + 1;
                  const isTaken = takenSeats.includes(seatNum);

                  return (
                    <Button
                      key={seatNum}
                      type="button"
                      variant="outline"
                      disabled={isTaken}
                      className={`px-2 py-2 border ${
                        selectedSeat === seatNum ? "bg-blue-500 text-white" : ""
                      } ${isTaken ? "bg-gray-300 cursor-not-allowed" : ""}`}
                      onClick={() => !isTaken && setValue("seat", seatNum)}
                    >
                      {seatNum}
                    </Button>
                  );
                })}
              </div>
              {errors.seat && (
                <p className="text-red-500 text-sm">{errors.seat.message}</p>
              )}

              {/* Personal info */}
              <p>Хувийн мэдээлэл</p>
              <Input
                placeholder="Имэйл"
                {...register("email")}
                className="border p-2 rounded"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}

              <Input
                placeholder="Утас"
                {...register("phone")}
                className="border p-2 rounded"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone.message}</p>
              )}

              <Button
                type="submit"
                className="bg-blue-500 text-white py-2 rounded mt-4"
                disabled={loading}
              >
                {loading ? "Илгээж байна..." : "Бүртгүүлэх"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
