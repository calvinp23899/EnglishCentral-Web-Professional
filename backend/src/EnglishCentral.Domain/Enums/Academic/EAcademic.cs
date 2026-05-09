namespace EnglishCentral.Domain.Enums.Academic
{
    public enum Gender
    {
        Male = 1,
        Female = 2,
        Other = 3
    }

    public enum StudentStatus
    {
        Active = 1,
        Inactive = 2,
        Suspended = 3,
        Graduated = 4
    }

    public enum TeacherStatus
    {
        Active = 1,
        Inactive = 2,
        Suspended = 3,
        Resigned = 4
    }

    public enum ClassStatus
    {
        Draft = 1,
        Open = 2,
        Ongoing = 3,
        Completed = 4,
        Cancelled = 5
    }

    public enum EnrollmentStatus
    {
        Active = 1,
        Dropped = 2,
        Transferred = 3,
        Completed = 4
    }

    public enum AttendanceStatus
    {
        Present = 1,
        Late = 2,
        Absent = 3,
        Excused = 4
    }

    public enum SessionStatus
    {
        Scheduled = 1,
        Completed = 2,
        Cancelled = 3,
        Rescheduled = 4
    }

    public enum CourseLevel
    {
        Beginner = 1,
        Elementary = 2,
        PreIntermediate = 3,
        Intermediate = 4,
        UpperIntermediate = 5,
        Advanced = 6,
        IELTSFoundation = 7,
        IELTSTarget5 = 8,
        IELTSTarget65 = 9,
        IELTSTarget75 = 10,
        TOEICFoundation = 11,
        TOEIC650 = 12,
        TOEIC850 = 13
    }
}
