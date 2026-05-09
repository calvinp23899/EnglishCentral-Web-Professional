using EnglishCentral.Domain.Common;

namespace EnglishCentral.Domain.Entities.Academic
{
    public class Room : BaseEntity
    {
        public string Code { get; set; } = default!;

        public string Name { get; set; } = default!;

        public int Capacity { get; set; }

        public string? Building { get; set; }

        public int? Floor { get; set; }

        public bool IsActive { get; set; } = true;

        // Navigation

        public ICollection<ClassSession> Sessions { get; set; } = [];
    }
}
