import { useMemo, useState } from "react";
import { ArrowLeft, Save, UserRoundPen } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { toastSuccess } from "@/components/ui";
import {
  genderLabels,
  statusLabels,
  students,
  type Student,
  type StudentGender,
  type StudentStatus,
} from "@/features/admin/students/data/mockStudents";

import styles from "./StudentEditPage.module.scss";

type StudentForm = Pick<
  Student,
  | "fullName"
  | "dateOfBirth"
  | "gender"
  | "email"
  | "phoneNumber"
  | "address"
  | "parentName"
  | "parentPhoneNumber"
  | "status"
  | "notes"
>;

const fallbackStudent = students[0];

const toStudentForm = (student: Student): StudentForm => ({
  fullName: student.fullName,
  dateOfBirth: student.dateOfBirth,
  gender: student.gender,
  email: student.email,
  phoneNumber: student.phoneNumber,
  address: student.address,
  parentName: student.parentName,
  parentPhoneNumber: student.parentPhoneNumber,
  status: student.status,
  notes: student.notes,
});

export function StudentEditPage() {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const student = useMemo(
    () => students.find((item) => item.id === studentId) ?? fallbackStudent,
    [studentId],
  );
  const initialFormValue = useMemo(() => toStudentForm(student), [student]);
  const [formValue, setFormValue] = useState<StudentForm>(initialFormValue);

  const updateField = <Key extends keyof StudentForm>(
    field: Key,
    value: StudentForm[Key],
  ) => {
    setFormValue((currentValue) => ({
      ...currentValue,
      [field]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toastSuccess("Lưu thay đổi học viên thành công.");
    navigate("/admin/students");
  };

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <div>
          <Link className={styles.backLink} to="/admin/students">
            <ArrowLeft aria-hidden="true" size={16} />
            Quay lại danh sách
          </Link>
          <h1>Chỉnh sửa học viên</h1>
        </div>

        <div className={styles.studentBadge}>
          <UserRoundPen aria-hidden="true" size={20} />
          <div>
            <strong>{student.studentCode}</strong>
            <span>{student.fullName}</span>
          </div>
        </div>
      </section>

      <form className={styles.formPanel} onSubmit={handleSubmit}>
        <div className={styles.formHeader}>
          <div>
            <h2>Thông tin học viên</h2>
            <p>Các trường này khớp payload cập nhật student.</p>
          </div>
        </div>

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>Full name</span>
            <input
              value={formValue.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>Date of birth</span>
            <input
              type="date"
              value={formValue.dateOfBirth}
              onChange={(event) => updateField("dateOfBirth", event.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>Gender</span>
            <select
              value={formValue.gender}
              onChange={(event) =>
                updateField("gender", Number(event.target.value) as StudentGender)
              }
            >
              {Object.entries(genderLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Email</span>
            <input
              type="email"
              value={formValue.email}
              onChange={(event) => updateField("email", event.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>Phone number</span>
            <input
              value={formValue.phoneNumber}
              onChange={(event) => updateField("phoneNumber", event.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>Address</span>
            <input
              value={formValue.address}
              onChange={(event) => updateField("address", event.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>Parent name</span>
            <input
              value={formValue.parentName}
              onChange={(event) => updateField("parentName", event.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>Parent phone number</span>
            <input
              value={formValue.parentPhoneNumber}
              onChange={(event) =>
                updateField("parentPhoneNumber", event.target.value)
              }
            />
          </label>

          <label className={styles.field}>
            <span>Status</span>
            <select
              value={formValue.status}
              onChange={(event) =>
                updateField("status", Number(event.target.value) as StudentStatus)
              }
            >
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className={`${styles.field} ${styles.notesField}`}>
            <span>Notes</span>
            <textarea
              rows={5}
              value={formValue.notes}
              onChange={(event) => updateField("notes", event.target.value)}
            />
          </label>
        </div>

        <div className={styles.formActions}>
          <button
            className={styles.cancelButton}
            type="button"
            onClick={() => setFormValue(initialFormValue)}
          >
            Hủy
          </button>
          <button type="submit">
            <Save aria-hidden="true" size={17} />
            Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  );
}
