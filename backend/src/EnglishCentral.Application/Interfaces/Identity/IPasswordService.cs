namespace EnglishCentral.Application.Interfaces.Identity
{
    public interface IPasswordService
    {
        string Hash(string password);
        bool Verify(string password, string hash);
    }
}
