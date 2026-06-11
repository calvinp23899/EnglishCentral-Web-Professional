using System.ComponentModel;
using System.Reflection;

namespace EnglishCentral.Shared.Common.Helpers
{
    public static class EnumHelper
    {
        public static string ToDescription(this Enum value)
        {
            var field = value.GetType().GetField(value.ToString());

            if (field == null)
                return value.ToString();

            var attribute = field.GetCustomAttribute<DescriptionAttribute>();

            return attribute?.Description ?? value.ToString();
        }
    }
}
