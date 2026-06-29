using EnglishCentral.Domain.Entities.Academic;

namespace EnglishCentral.Application.Features.Academic.Rooms.DTOs
{
    public record RoomResponse(
        Guid PublicId,
        long Id,
        string Code,
        string Name,
        int Capacity,
        string? Building,
        int? Floor,
        bool IsActive);

    public static class RoomMapping
    {
        public static RoomResponse ToResponse(this Room room)
        {
            return new RoomResponse(
                room.PublicId,
                room.Id,
                room.Code,
                room.Name,
                room.Capacity,
                room.Building,
                room.Floor,
                room.IsActive);
        }
    }
}
