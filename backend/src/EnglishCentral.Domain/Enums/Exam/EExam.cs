using System.ComponentModel;

namespace EnglishCentral.Domain.Enums.Exam
{
    public enum EExamFamily
    {
        [Description("IELTS")]
        IELTS = 1,
        [Description("TOEIC")]
        TOEIC = 2,
        [Description("PTE")]
        PTE = 3,
        [Description("KET")]
        KET = 4,
        [Description("PET")]
        PET = 5,
        [Description("VSTEP")]
        VSTEP = 6,
        [Description("Custom")]
        Custom = 99
    }

    public enum EExamTemplateStatus
    {
        Draft = 1,
        Published = 2,
        Archived = 3
    }

    public enum EExamSkill
    {
        Listening = 1,
        Reading = 2,
        Writing = 3,
        Speaking = 4,
        Grammar = 5,
        Vocabulary = 6,
        Integrated = 7
    }

    public enum EExamStimulusType
    {
        Text = 1,
        Audio = 2,
        Image = 3,
        Video = 4,
        Mixed = 5
    }

    public enum EExamQuestionType
    {
        MultipleChoiceSingle = 1,
        MultipleChoiceMultiple = 2,
        TrueFalseNotGiven = 3,
        YesNoNotGiven = 4,
        MatchingHeadingDragDrop = 5,
        MatchingNameDragDrop = 6,
        MatchingInformationTableSelectGrid = 7,
        GapFill = 8,
        ShortAnswer = 9,
        Essay = 10,
        SpeakingPrompt = 11,
        Ordering = 12,
        //TableOptions = 13
    }

    public enum EExamAttemptStatus
    {
        NotStarted = 1,
        InProgress = 2,
        Submitted = 3,
        Scoring = 4,
        Completed = 5,
        Abandoned = 6,
        Cancelled = 7
    }

    public enum EExamScoringMode
    {
        Auto = 1,
        Manual = 2,
        Hybrid = 3
    }

    public enum EExamReviewStatus
    {
        Pending = 1,
        InReview = 2,
        Reviewed = 3,
        Reopened = 4
    }
}
