namespace EnglishCentral.Shared.Common.Helpers
{
    public static class CodeGeneratorHelper
    {
        private static readonly Random _random = Random.Shared;

        public static string GenerateNumeric(int digits = 5)
        {
            var min = (int)Math.Pow(10, digits - 1);
            var max = (int)Math.Pow(10, digits) - 1;
            return _random.Next(min, max).ToString();
        }

        public static string GenerateWithPrefixAndTick(string prefix)
        {
            var tick = DateTimeOffset.UtcNow.Ticks;
            return $"{prefix}-{tick}";
        }
    }
}
