namespace EnglishCentral.Domain.Enums.Academic
{
    public enum EGender
    {
        Male = 1,
        Female = 2,
        Other = 3
    }

    public enum EStatus
    {
        Active = 1,
        Inactive = 2,
    }

    public enum ETeacherStatus
    {
        Active = 1,
        Inactive = 2,
        Suspended = 3,
        Resigned = 4
    }

    public enum EClassStatus
    {
        Draft = 1,
        Open = 2,
        Ongoing = 3,
        Completed = 4,
        Cancelled = 5
    }

    public enum EEnrollmentStatus
    {
        Active = 1,
        Dropped = 2,
        Transferred = 3,
        Completed = 4
    }

    public enum EAttendanceStatus
    {
        Present = 1,
        Late = 2,
        Absent = 3,
        Excused = 4
    }

    public enum ESessionStatus
    {
        Scheduled = 1,
        Completed = 2,
        Cancelled = 3,
        Rescheduled = 4
    }

    public enum ECourseLevel
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

    public enum EContractType
    {
        FullTime,
        PartTime,
        Freelance
    }
    public enum ESalaryType
    {
        Fixed,
        Hourly,
        PerSession
    }

    public enum EColumnSortGetTeacher
    {
        TeacherCode,
        FullName,
        HireDate,
        Status,
        Role
    }

    public enum EOrderSort
    {
        Ascending,
        Descending,
    }
}
