using FluentValidation;

namespace EnglishCentral.API.Middlewares
{
    public sealed class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(
            RequestDelegate next,
            ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (ValidationException ex)
            {
                context.Response.StatusCode = 400;

                await context.Response.WriteAsJsonAsync(new
                {
                    success = false,
                    message = "Validation failed",
                    errors = ex.Errors.Select(x => new
                    {
                        property = x.PropertyName,
                        error = x.ErrorMessage
                    })
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                context.Response.StatusCode = 401;

                await context.Response.WriteAsJsonAsync(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (KeyNotFoundException ex)
            {
                context.Response.StatusCode = 404;

                await context.Response.WriteAsJsonAsync(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);

                context.Response.StatusCode = 500;

                await context.Response.WriteAsJsonAsync(new
                {
                    success = false,
                    message = "Internal server error"
                });
            }
        }
    }
}
