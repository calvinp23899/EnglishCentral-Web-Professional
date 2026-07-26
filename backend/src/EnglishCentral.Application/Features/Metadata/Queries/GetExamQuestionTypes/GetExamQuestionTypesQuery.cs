using EnglishCentral.Contracts.Responses.Metadata;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Metadata.Queries.GetExamQuestionTypes
{
    public record GetExamQuestionTypesQuery(string? Family, string? Skill) : IRequest<Result<List<MetadataOptionResponse>>>;
}
