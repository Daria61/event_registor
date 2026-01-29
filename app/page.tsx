"use client";

import Image from "next/image";
import { MessageCircleHeart, Calendar, MapPin, Link } from "lucide-react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"
import { useState, useEffect } from "react";

const TIME = ["12:00", "14:00"]

export const registrationSchema = z.object({
  time: z.enum(TIME),
  seat: z.number().min(1, "Суудал сонгоно уу"),
  email: z.string().email("Имэйл буруу байна"),
  phone: z.string().min(5, "Утасны дугаарыг оруулна уу"),
});

export default function Home() {
    const [takenSeats, setTakenSeats] = useState<number[]>([]);
    const [loading, setLoading] = useState(false); 

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
      seat: 1,
      email: "",
      phone: "",
    },
  });

  const selectedTime = watch("time"); // track selected time
  const selectedSeat = watch("seat"); // track selected seat

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
    }finally {
      setLoading(false); // <-- stop loading
    }
  };

  useEffect(() => {
    if (!selectedTime) return;

    const fetchTakenSeats = async () => {
      try {
        const res = await fetch(`/api/register?time=${selectedTime}`);
        const data = await res.json();
        if (data.status === "success") {
          setTakenSeats(data.takenSeats);
          // Reset seat if currently selected seat is taken
          if (data.takenSeats.includes(selectedSeat)) setValue("seat", 0);
        } else {
          toast.error("Суудлын мэдээллийг авахад алдаа гарлаа");
        }
      } catch (err) {
        toast.error("Суудлын мэдээллийг авахад алдаа гарлаа");
      }
    };

    fetchTakenSeats();
  }, [selectedTime]);

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
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 items-center">
              <MessageCircleHeart width={30} />
              <div>
                <p>Нийт 40 суудал</p>
                <p className="text-gray-600 text-[12px]">Нэг өдөрлөг 20 суудал</p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <Calendar width={30} />
              <div>
                <p>2 сарын 1 - 12:00/14:00 </p>
                <p className="text-gray-600 text-[12px]">Бүтэнсайн өдөр</p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <MapPin width={30} />
              <div>
                <p>Stoic Office</p>
                <a
                  href="https://www.google.com/maps/place/Stoic+Education+Consulting+Firm/@47.9172052,106.9069526,743m/data=!3m2!1e3!4b1!4m6!3m5!1s0x5d96935a9986ab71:0xadd672bf4954577!8m2!3d47.9172016!4d106.9095275!16s%2Fg%2F11xp4903pk!5m1!1e1?entry=ttu&g_ep=EgoyMDI2MDEyNy4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  className="text-gray-600 text-[12px] flex gap-2 items-center"
                >
                  Мөнгөн завьяа <Link width={12} />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-10">
            <p className="font-semibold mb-3 text-xl">Тайлбар</p>
            Энэхүү нээлттэй өдөрлөг нь манай их сургуулийн өргөдөл бэлдэх
            хөтөлбөрийн талаар мэдээлэл авах хүсэлтэй эцэг эх, асран хамгаалагч
            болон хөтөлбөрт хамрагдах хүсэлтэй сурагчдад зориулсан юм. Өдөрлөгт
            оролцсоноор гадаадын их сургуулиудын өргөдлийн системийн талаар
            суурь мэдлэгтэй болох ба өдөрлөгийн дараа мэргэжлийн багш нараас
            ганцаарчилсан зөвлөгөө үнэ төлбөргүй авах боломжтой.
            <br />
            <br />
            Өдөрлөгт дараах хичээлүүд багтана:
            <br />
            - СТОИК сургалтын төвийн үйл ажиллагаа
            <br />
            - АНУ, Европ, Азийн их сургуулиудын өргөдлийн систем
            <br />
            - IELTS, TOEFL, SAT шалгалтууд
            <br />
            - Хичээлээс гадуурх үйл ажиллагаа
            <br />
            - Өргөдлөө хэрхэн бэлдэх
            <br />- Тэтгэлэг болон санхүүгийн тусламж
          </div>

           <div className="mt-10">
            <p className="font-semibold my-3 text-xl">Бүртгүүлэх</p>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              {/* Time selection */}
              <p>Цаг сонгох</p>
              <div className="flex gap-4">
                {TIME.map((time) => (
                  <Button
                    key={time}
                    type="button"
                    variant="outline"
                    className={`px-4 py-2 border ${selectedTime === time ? "bg-blue-500 text-white" : ""}`}
                    onClick={() => setValue("time", time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
              {errors.time && <p className="text-red-500 text-sm">{errors.time.message}</p>}

              {/* Seat selection */}
              <p>Суудал сонгох</p>
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: 20 }).map((_, ind) => {
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
              {errors.seat && <p className="text-red-500 text-sm">{errors.seat.message}</p>}

              {/* Personal info */}
              <p>Хувийн мэдээлэл</p>
              <Input placeholder="Имэйл" {...register("email")} className="border p-2 rounded" />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

              <Input placeholder="Утас" {...register("phone")} className="border p-2 rounded" />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}

              <Button type="submit" className="bg-blue-500 text-white py-2 rounded mt-4" disabled={loading}>
               {loading? "Илгээж байна...":  "Бүртгүүлэх"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
