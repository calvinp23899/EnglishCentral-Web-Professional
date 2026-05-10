using Microsoft.AspNetCore.Authorization;

namespace EnglishCentral.Infrastructure.Authorization
{

    public class HasPermissionAttribute : AuthorizeAttribute
    {
        public HasPermissionAttribute(
            string permission)
        {
            Policy = $"Permission:{permission}";
        }
    }
}
