using EnglishCentral.Contracts.Responses.Metadata;
using EnglishCentral.Domain.Enums.Exam;
using EnglishCentral.Shared.Results;
using MediatR;
using System.ComponentModel;
using System.Reflection;

namespace EnglishCentral.Application.Features.Metadata.Queries.GetExamQuestionTypes
{
    public class GetExamQuestionTypesQueryHandler : IRequestHandler<GetExamQuestionTypesQuery, Result<List<MetadataOptionResponse>>>
    {
        public Task<Result<List<MetadataOptionResponse>>> Handle(GetExamQuestionTypesQuery request, CancellationToken ct)
        {
            var hasFamily = !string.IsNullOrWhiteSpace(request.Family);
            var hasSkill = !string.IsNullOrWhiteSpace(request.Skill);

            if (!hasFamily && !hasSkill)
                return Success(ToMetadata(Enum.GetValues<EExamQuestionType>()));

            EExamFamily? family = null;
            if (hasFamily)
            {
                if (!Enum.TryParse<EExamFamily>(request.Family!.Trim(), ignoreCase: true, out var parsedFamily) || !Enum.IsDefined(parsedFamily))
                {
                    var allowedValues = string.Join(", ", Enum.GetNames<EExamFamily>());
                    return Task.FromResult(Result<List<MetadataOptionResponse>>.Failure(
                        $"Invalid exam family: {request.Family}. Allowed values: {allowedValues}.",
                        400));
                }

                family = parsedFamily;
            }

            EExamSkill? skill = null;
            if (hasSkill)
            {
                if (!Enum.TryParse<EExamSkill>(request.Skill!.Trim(), ignoreCase: true, out var parsedSkill) || !Enum.IsDefined(parsedSkill))
                {
                    var allowedValues = string.Join(", ", Enum.GetNames<EExamSkill>());
                    return Task.FromResult(Result<List<MetadataOptionResponse>>.Failure(
                        $"Invalid exam skill: {request.Skill}. Allowed values: {allowedValues}.",
                        400));
                }

                skill = parsedSkill;
            }

            return Success(GetQuestionTypeMetadata(family, skill));
        }

        private static List<MetadataOptionResponse> GetQuestionTypeMetadata(EExamFamily? family, EExamSkill? skill)
        {
            if (family == EExamFamily.IELTS && skill == EExamSkill.Listening)
                return ToDescriptionMetadata(Enum.GetValues<EIELTSListeningQuestionType>());

            if (family.HasValue && skill.HasValue)
                return ToMetadata(GetQuestionTypesByFamilyAndSkill(family.Value, skill.Value));

            if (family.HasValue)
                return ToMetadata(GetQuestionTypesByFamily(family.Value));

            return ToMetadata(GetQuestionTypesBySkill(skill!.Value));
        }

        private static EExamQuestionType[] GetQuestionTypesByFamilyAndSkill(EExamFamily family, EExamSkill skill) =>
            family switch
            {
                EExamFamily.IELTS => GetIeltsQuestionTypesBySkill(skill),
                EExamFamily.TOEIC => GetToeicQuestionTypesBySkill(skill),
                EExamFamily.PTE => GetPteQuestionTypesBySkill(skill),
                EExamFamily.KET or EExamFamily.PET or EExamFamily.VSTEP => GetCambridgeStyleQuestionTypesBySkill(skill),
                EExamFamily.Custom => GetQuestionTypesBySkill(skill),
                _ => []
            };

        private static EExamQuestionType[] GetQuestionTypesByFamily(EExamFamily family) => family switch
        {
            EExamFamily.IELTS =>
            [
                EExamQuestionType.SingleChoice,
                EExamQuestionType.MultipleChoice,
                EExamQuestionType.TrueFalseNotGiven,
                EExamQuestionType.YesNoNotGiven,
                EExamQuestionType.MatchingHeadingDragDrop,
                EExamQuestionType.SummaryCompletionWithOptions,
                EExamQuestionType.MatchingInformationTableSelectGrid,
                EExamQuestionType.GapFill,
                EExamQuestionType.ShortAnswer,
                EExamQuestionType.Essay,
                EExamQuestionType.SpeakingPrompt
            ],
            EExamFamily.TOEIC =>
            [
                EExamQuestionType.SingleChoice,
                EExamQuestionType.MultipleChoice,
                EExamQuestionType.GapFill,
                EExamQuestionType.ShortAnswer
            ],
            EExamFamily.PTE =>
            [
                EExamQuestionType.SingleChoice,
                EExamQuestionType.MultipleChoice,
                EExamQuestionType.GapFill,
                EExamQuestionType.ShortAnswer,
                EExamQuestionType.Essay,
                EExamQuestionType.SpeakingPrompt
            ],
            EExamFamily.KET or EExamFamily.PET or EExamFamily.VSTEP =>
            [
                EExamQuestionType.SingleChoice,
                EExamQuestionType.MultipleChoice,
                EExamQuestionType.GapFill,
                EExamQuestionType.ShortAnswer,
                EExamQuestionType.Essay,
                EExamQuestionType.SpeakingPrompt
            ],
            EExamFamily.Custom => Enum.GetValues<EExamQuestionType>(),
            _ => []
        };

        private static EExamQuestionType[] GetQuestionTypesBySkill(EExamSkill skill) => skill switch
        {
            EExamSkill.Listening => [],
            EExamSkill.Reading =>
            [
                EExamQuestionType.SingleChoice,
                EExamQuestionType.MultipleChoice,
                EExamQuestionType.TrueFalseNotGiven,
                EExamQuestionType.YesNoNotGiven,
                EExamQuestionType.MatchingHeadingDragDrop,
                EExamQuestionType.SummaryCompletionWithOptions,
                EExamQuestionType.MatchingInformationTableSelectGrid,
                EExamQuestionType.GapFill,
                EExamQuestionType.ShortAnswer
            ],
            EExamSkill.Writing => [EExamQuestionType.Essay],
            EExamSkill.Speaking => [EExamQuestionType.SpeakingPrompt],
            EExamSkill.Grammar or EExamSkill.Vocabulary =>
            [
                EExamQuestionType.SingleChoice,
                EExamQuestionType.MultipleChoice,
                EExamQuestionType.GapFill,
                EExamQuestionType.ShortAnswer,
                EExamQuestionType.Ordering
            ],
            EExamSkill.Integrated => Enum.GetValues<EExamQuestionType>(),
            _ => []
        };

        private static EExamQuestionType[] GetIeltsQuestionTypesBySkill(EExamSkill skill) => skill switch
        {
            EExamSkill.Listening =>
            [
                EExamQuestionType.SingleChoice,
                EExamQuestionType.MultipleChoice,
                EExamQuestionType.GapFill,
                EExamQuestionType.ShortAnswer,
                EExamQuestionType.MatchingHeadingDragDrop
            ],
            EExamSkill.Reading =>
            [
                EExamQuestionType.SingleChoice,
                EExamQuestionType.MultipleChoice,
                EExamQuestionType.TrueFalseNotGiven,
                EExamQuestionType.YesNoNotGiven,
                EExamQuestionType.MatchingHeadingDragDrop,
                EExamQuestionType.SummaryCompletionWithOptions,
                EExamQuestionType.MatchingInformationTableSelectGrid,
                EExamQuestionType.GapFill,
                EExamQuestionType.ShortAnswer
            ],
            EExamSkill.Writing => [EExamQuestionType.Essay],
            EExamSkill.Speaking => [EExamQuestionType.SpeakingPrompt],
            _ => []
        };

        private static EExamQuestionType[] GetToeicQuestionTypesBySkill(EExamSkill skill) => skill switch
        {
            EExamSkill.Listening or EExamSkill.Reading =>
            [
                EExamQuestionType.SingleChoice,
                EExamQuestionType.MultipleChoice,
                EExamQuestionType.GapFill,
                EExamQuestionType.ShortAnswer
            ],
            _ => []
        };

        private static EExamQuestionType[] GetPteQuestionTypesBySkill(EExamSkill skill) => skill switch
        {
            EExamSkill.Listening or EExamSkill.Reading =>
            [
                EExamQuestionType.SingleChoice,
                EExamQuestionType.MultipleChoice,
                EExamQuestionType.GapFill,
                EExamQuestionType.ShortAnswer
            ],
            EExamSkill.Writing => [EExamQuestionType.Essay],
            EExamSkill.Speaking => [EExamQuestionType.SpeakingPrompt],
            EExamSkill.Integrated => GetQuestionTypesByFamily(EExamFamily.PTE),
            _ => []
        };

        private static EExamQuestionType[] GetCambridgeStyleQuestionTypesBySkill(EExamSkill skill) => skill switch
        {
            EExamSkill.Listening or EExamSkill.Reading =>
            [
                EExamQuestionType.SingleChoice,
                EExamQuestionType.MultipleChoice,
                EExamQuestionType.GapFill,
                EExamQuestionType.ShortAnswer
            ],
            EExamSkill.Writing => [EExamQuestionType.Essay],
            EExamSkill.Speaking => [EExamQuestionType.SpeakingPrompt],
            _ => []
        };

        private static List<MetadataOptionResponse> ToMetadata(IEnumerable<EExamQuestionType> questionTypes)
        {
            return questionTypes
                .Select(x => new MetadataOptionResponse(
                    Label: x.ToString(),
                    Value: x.ToString(),
                    Code: Convert.ToInt32(x)))
                .ToList();
        }

        private static List<MetadataOptionResponse> ToDescriptionMetadata<T>(IEnumerable<T> values) where T : struct, Enum
        {
            return values
                .Select(x => new MetadataOptionResponse(
                    Label: GetEnumDescription(x),
                    Value: x.ToString(),
                    Code: Convert.ToInt32(x)))
                .ToList();
        }

        private static string GetEnumDescription<T>(T value) where T : struct, Enum
        {
            return typeof(T)
                .GetMember(value.ToString())
                .FirstOrDefault()?
                .GetCustomAttribute<DescriptionAttribute>()?
                .Description ?? value.ToString();
        }

        private static Task<Result<List<MetadataOptionResponse>>> Success(List<MetadataOptionResponse> data)
        {
            return Task.FromResult(Result<List<MetadataOptionResponse>>.Success(data));
        }
    }
}
