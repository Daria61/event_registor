import { MessageCircleHeart, Calendar, MapPin, Link } from "lucide-react";
import { ScheduleMap } from "@/app/page";

export const EventInfo = ({
  totalSeats,
  count,
  schedule,
}: {
  totalSeats: number;
  count: number;
  schedule: ScheduleMap;
}) => {
const text = Object.entries(schedule)
  .map(([date, times]) => {
    // "1 сарын 31" → ["1", "31"]
    const [month, day] = date.match(/\d+/g);

    return `${month}/${day} - ${times.join("/")}`;
  })
  .join(", ");

  return (
    <>
      {" "}
      <div className="flex flex-col gap-3">
        <div className="flex gap-2 items-center">
          <MessageCircleHeart width={30} />
          <div>
            <p>Нийт {totalSeats} суудал</p>
            <p className="text-gray-600 text-[12px]">
              Нийт {totalSeats - count} суудал үлдлээ
            </p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Calendar width={30} />
          <div>
            <p> {text} </p>
            <p className="text-gray-600 text-[12px]">Өдөрлөг болох өдрүүд</p>
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
        оролцсоноор гадаадын их сургуулиудын өргөдлийн системийн талаар суурь
        мэдлэгтэй болох ба өдөрлөгийн дараа мэргэжлийн багш нараас ганцаарчилсан
        зөвлөгөө үнэ төлбөргүй авах боломжтой.
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
    </>
  );
};
