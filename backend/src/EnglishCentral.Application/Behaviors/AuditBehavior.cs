using MediatR;
using Microsoft.Extensions.Logging;

namespace EnglishCentral.Application.Behaviors
{
    public sealed class AuditBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse> where TRequest : notnull
    {
        private readonly ILogger<AuditBehavior<TRequest, TResponse>> _logger;

        public AuditBehavior(ILogger<AuditBehavior<TRequest, TResponse>> logger)
        {
            _logger = logger;
        }

        public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
        {
            var requestName = typeof(TRequest).Name;
            _logger.LogInformation("Audit request {RequestName} at {AuditTime}", requestName, DateTimeOffset.UtcNow);
            return await next();
        }
    }
}
