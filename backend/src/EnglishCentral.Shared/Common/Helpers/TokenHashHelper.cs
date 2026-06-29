using System.Security.Cryptography;
using System.Text;

namespace EnglishCentral.Shared.Common.Helpers
{
    public static class TokenHashHelper
    {
        public static string HashRefreshToken(string rawToken)
        {
            return Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(rawToken)));
        }
    }
}
