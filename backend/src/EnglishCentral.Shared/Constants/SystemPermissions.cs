namespace EnglishCentral.Shared.Constants
{
    public static class SystemPermissions
    {
        #region Security Permissions
        // Role
        public const string RoleRead = "role.read";
        public const string RoleCreate = "role.create";
        public const string RoleUpdate = "role.update";
        public const string RoleDelete = "role.delete";
        #endregion

        #region Academic Permissions
        // Students
        public const string StudentRead = "student.read";
        public const string StudentCreate = "student.create";
        public const string StudentUpdate = "student.update";
        public const string StudentDelete = "student.delete";

        // Teachers
        public const string TeacherRead = "teacher.read";
        public const string TeacherCreate = "teacher.create";
        public const string TeacherUpdate = "teacher.update";
        public const string TeacherDelete = "teacher.delete";

        // Courses
        public const string CourseRead = "course.read";
        public const string CourseCreate = "course.create";
        public const string CourseUpdate = "course.update";
        public const string CourseDelete = "course.delete";

        // Course Categories
        public const string CourseCategoryRead = "course_category.read";
        public const string CourseCategoryCreate = "course_category.create";
        public const string CourseCategoryUpdate = "course_category.update";
        public const string CourseCategoryDelete = "course_category.delete";

        // Rooms
        public const string RoomRead = "room.read";
        public const string RoomCreate = "room.create";
        public const string RoomUpdate = "room.update";
        public const string RoomDelete = "room.delete";

        // Classes
        public const string ClassRead = "class.read";
        public const string ClassCreate = "class.create";
        public const string ClassUpdate = "class.update";
        public const string ClassDelete = "class.delete";

        // Class Schedules
        public const string ClassScheduleRead = "class_schedule.read";
        public const string ClassScheduleCreate = "class_schedule.create";
        public const string ClassScheduleUpdate = "class_schedule.update";
        public const string ClassScheduleDelete = "class_schedule.delete";

        // Class Sessions
        public const string ClassSessionRead = "class_session.read";
        public const string ClassSessionCreate = "class_session.create";
        public const string ClassSessionUpdate = "class_session.update";
        public const string ClassSessionDelete = "class_session.delete";

        // Enrollments
        public const string EnrollmentRead = "enrollment.read";
        public const string EnrollmentCreate = "enrollment.create";
        public const string EnrollmentUpdate = "enrollment.update";
        public const string EnrollmentDelete = "enrollment.delete";

        // Attendances
        public const string AttendanceRead = "attendance.read";
        public const string AttendanceCreate = "attendance.create";
        public const string AttendanceUpdate = "attendance.update";
        public const string AttendanceDelete = "attendance.delete";
        #endregion

        #region Finance Permissions
        // Billing
        public const string BillingRead = "billing.read";
        public const string BillingCreate = "billing.create";
        public const string BillingUpdate = "billing.update";
        public const string BillingDelete = "billing.delete";
        public const string BillingPaymentCreate = "billing.payment.create";
        #endregion

        #region Exam Permissions
        public const string ExamRead = "exam.read";
        public const string ExamCreate = "exam.create";
        public const string ExamUpdate = "exam.update";
        public const string ExamDelete = "exam.delete";
        public const string ExamReview = "exam.review";
        #endregion

    }
}
