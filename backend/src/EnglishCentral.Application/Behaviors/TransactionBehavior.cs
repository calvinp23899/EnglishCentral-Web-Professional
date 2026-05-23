using EnglishCentral.Application.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace EnglishCentral.Application.Behaviors
{
    public sealed class TransactionBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse> where TRequest : notnull
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<TransactionBehavior<TRequest, TResponse>> _logger;

        public TransactionBehavior(IUnitOfWork unitOfWork, ILogger<TransactionBehavior<TRequest, TResponse>> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
        {
            var requestName = typeof(TRequest).Name;

            if (!requestName.EndsWith("Command"))
            {
                return await next();
            }
            await using var transaction = await _unitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                _logger.LogInformation("Beginning transaction for {RequestName}", requestName);

                var response = await next();
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);

                _logger.LogInformation("Committed transaction for {RequestName}", requestName);
                return response;
            }
            catch
            {
                await transaction.RollbackAsync(cancellationToken);
                _logger.LogWarning("Rolled back transaction for {RequestName}", requestName);
                throw;
            }
        }
    }
}
