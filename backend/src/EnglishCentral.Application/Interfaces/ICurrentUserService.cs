namespace EnglishCentral.Application.Interfaces
{
    public interface ICurrentUserService
    {
        long? UserPublicId { get; }
        long? UserId { get; }
        string FullName { get; }
    }
}
