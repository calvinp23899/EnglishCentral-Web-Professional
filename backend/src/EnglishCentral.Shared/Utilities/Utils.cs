namespace EnglishCentral.Shared.Utilities
{
    public static class Utils
    {
        /// <summary>
        /// This function use for user display
        /// </summary>
        /// <param name="value"></param>
        /// <returns></returns>
        public static string TrimAndUpperString(this string value)
        {
            return value.Trim().ToUpper();
        }

        /// <summary>
        /// This function use for CODE LOGIC TO CHECK AT DATABASE
        /// </summary>
        /// <param name="value"></param>
        /// <returns></returns>
        public static string TrimAndUpperInvariantString(this string value)
        {
            return value.Trim().ToUpperInvariant();
        }

        /// <summary>
        /// This function use for CODE LOGIC TO CHECK AT DATABASE
        /// </summary>
        /// <param name="value"></param>
        /// <returns></returns>
        public static string ConvertNameToCode(this string value)
        {
            return value.Trim().ToUpperInvariant().Replace(" ", "_"); ;
        }

    }
}
