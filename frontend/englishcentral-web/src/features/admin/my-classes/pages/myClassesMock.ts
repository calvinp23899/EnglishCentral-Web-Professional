export type MyClassRecord = {
  id: number;
  code: string;
  name: string;
  courseName: string;
  roomName: string;
  teacherName: string;
  enrolledCount: number;
  capacity: number;
  startDate: string;
  endDate: string;
  scheduleText: string;
};

export const myClassRecords: MyClassRecord[] = [
  {
    id: 1,
    code: "IELTS-CLA-01",
    name: "IELTS Foundation",
    courseName: "IELTS 5.0 Foundation",
    roomName: "A204",
    teacherName: "Ms. Linh",
    enrolledCount: 8,
    capacity: 10,
    startDate: "2026-06-03",
    endDate: "2026-09-03",
    scheduleText: "Thứ 2, Thứ 4 - 08:00",
  },
  {
    id: 2,
    code: "TOEIC-CLA-02",
    name: "TOEIC Listening",
    courseName: "TOEIC 650+",
    roomName: "B102",
    teacherName: "Mr. David",
    enrolledCount: 12,
    capacity: 15,
    startDate: "2026-06-10",
    endDate: "2026-08-28",
    scheduleText: "Thứ 3, Thứ 5 - 10:00",
  },
  {
    id: 3,
    code: "KIDS-CLA-03",
    name: "Kids Starters",
    courseName: "Kids Starter",
    roomName: "A101",
    teacherName: "Ms. Mai",
    enrolledCount: 6,
    capacity: 12,
    startDate: "2026-06-15",
    endDate: "2026-10-15",
    scheduleText: "Thứ 7 - 09:00",
  },
];

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("vi-VN").format(new Date(value));
