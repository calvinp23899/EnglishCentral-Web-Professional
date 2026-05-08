namespace EnglishCentral.Domain.Common
{
    public abstract class BaseEntity
    {
        public long Id { get; set; }

        public Guid PublicId { get; set; } = Guid.NewGuid();

        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

        public long? CreatedBy { get; set; }

        public DateTimeOffset? UpdatedAt { get; set; }

        public long? UpdatedBy { get; set; }

        public DateTimeOffset? DeletedAt { get; set; }

        public long? DeletedBy { get; set; }

        public bool IsDeleted { get; set; }
    }
}
