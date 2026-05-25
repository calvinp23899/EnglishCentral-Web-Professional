namespace EnglishCentral.Shared.Common.PaginationHelpers
{
    public record PagedResult<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalItems, int TotalPages)
    {
        public bool HasPreviousPage => Page > 1;
        public bool HasNextPage => Page < TotalPages;

        public static PagedResult<T> Create(
            IReadOnlyList<T> items,
            int page,
            int pageSize,
            int totalItems)
        {
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            return new PagedResult<T>(
                items,
                page,
                pageSize,
                totalItems,
                totalPages);
        }
    }
}
