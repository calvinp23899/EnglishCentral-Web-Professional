import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import formStyles from "@/features/admin/students/pages/StudentCreatePage.module.scss";
import classStyles from "@/features/admin/classes/pages/ClassViewPage.module.scss";

import { formatDate, myClassRecords } from "./myClassesMock";

type TabKey = "info" | "sessions" | "documents" | "attendance" | "reviews";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "info", label: "Thông tin lớp học" },
  { key: "sessions", label: "Buổi Học" },
  { key: "documents", label: "Tài Liệu" },
  { key: "attendance", label: "Điểm danh" },
  { key: "reviews", label: "Đánh Giá" },
];

export function MyClassViewPage() {
  const { classId } = useParams();
  const [activeTab, setActiveTab] = useState<TabKey>("info");
  const record = useMemo(
    () => myClassRecords.find((item) => String(item.id) === String(classId)) ?? myClassRecords[0],
    [classId],
  );

  const field = (label: string, value: string | number) => (
    <label className={formStyles.field}>
      <span>{label}</span>
      <input readOnly value={value} />
    </label>
  );

  return (
    <div className={formStyles.page}>
      <section className={formStyles.header}>
        <div>
          <Link className={formStyles.backLink} to="/admin/my-classes">
            <ArrowLeft aria-hidden="true" size={16} />
            Quay lại danh sách
          </Link>
          <h1>Chi tiết lớp của tôi</h1>
        </div>
      </section>

      <section className={formStyles.panel}>
        <div className={classStyles.tabs} role="tablist" aria-label="Chi tiết lớp của tôi">
          {tabs.map((tab) => (
            <button
              aria-selected={activeTab === tab.key}
              className={activeTab === tab.key ? classStyles.activeTab : undefined}
              key={tab.key}
              role="tab"
              type="button"
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "info" ? (
          <div className={classStyles.tabContent}>
            <div className={classStyles.tabHeader}>
              <div>
                <h2>Thông tin lớp học</h2>
                <p>Xem thông tin tổng quan của lớp đang phụ trách.</p>
              </div>
            </div>

            <div className={formStyles.formGrid}>
              {field("Mã lớp", record.code)}
              {field("Tên lớp", record.name)}
              {field("Khóa học", record.courseName)}
              {field("Nhân viên", record.teacherName)}
              {field("Phòng học", record.roomName)}
              {field("Sĩ số", `${record.enrolledCount}/${record.capacity}`)}
              {field("Ngày bắt đầu", formatDate(record.startDate))}
              {field("Ngày kết thúc", formatDate(record.endDate))}
              {field("Lịch học", record.scheduleText)}
            </div>
          </div>
        ) : (
          <div className={classStyles.tabContent}>
            <div className={classStyles.tabHeader}>
              <div>
                <h2>{tabs.find((tab) => tab.key === activeTab)?.label}</h2>
                <p>UI tạm cho tab này, chờ tích hợp dữ liệu thật.</p>
              </div>
            </div>
            <div className={classStyles.emptyState}>
              Nội dung {tabs.find((tab) => tab.key === activeTab)?.label} sẽ được dựng chi tiết sau.
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
