using EnglishCentral.Domain.Common;

namespace EnglishCentral.Domain.Entities
{
    public class RefreshToken : BaseEntity
    {
        public long UserId { get; set; }

        public User User { get; set; } = default!;

        public string TokenHash { get; set; } = default!;

        public DateTimeOffset ExpiresAt { get; set; }

        public DateTimeOffset? RevokedAt { get; set; }

        public string? IpAddress { get; set; }

        public string? DeviceInfo { get; set; }
    }
}
