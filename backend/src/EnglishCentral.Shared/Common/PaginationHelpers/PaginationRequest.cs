namespace EnglishCentral.Shared.Common.PaginationHelpers
{
    public record PaginationRequest
    {
        private const int MaxPageSize = 20;
        private int _pageSize = 10;

        public int Page { get; init; } = 1;
        public int PageSize
        {
            get => _pageSize;
            init => _pageSize = value > MaxPageSize ? MaxPageSize : value;
        }
        public string? Keyword { get; init; }
    }
}
