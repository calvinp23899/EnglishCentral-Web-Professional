using EnglishCentral.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using System.IdentityModel.Tokens.Jwt;

namespace EnglishCentral.Infrastructure.Services.CurrentUser
{
    public sealed class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public long? UserId
        {
            get
            {
                var userId = _httpContextAccessor.HttpContext?
                    .User?
                    .FindFirst("userId")?
                    .Value;

                return long.TryParse(userId, out var id) ? id : null;
            }
        }

        public string? FullName
        {
            get
            {
                return _httpContextAccessor.HttpContext?
                    .User?
                    .FindFirst(JwtRegisteredClaimNames.Name)?
                    .Value;
            }
        }

        public long? UserPublicId => throw new NotImplementedException();
    }
}
