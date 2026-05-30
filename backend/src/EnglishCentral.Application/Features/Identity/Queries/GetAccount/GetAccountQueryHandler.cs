using EnglishCentral.Application.Interfaces.Identity;
using EnglishCentral.Contracts.Responses.Identity;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Identity.Queries.GetAccount
{
    public class GetAccountQueryHandler : IRequestHandler<GetAccountQuery, Result<List<AccountResponse>>>
    {
        private readonly IUserRepository _userRepository;

        public GetAccountQueryHandler(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<Result<List<AccountResponse>>> Handle(GetAccountQuery request, CancellationToken cancellationToken)
        {
            var users = await _userRepository.GetUserAccountBySearch(request.Search);
            if (!users.Any())
                return Result<List<AccountResponse>>.Failure("Search is not found", 404);
            var accounts = users.Select(x => new AccountResponse(
                Id: x.Id,
                FullName: x.FullName,
                Email: x.Email,
                PhoneNumber: x.PhoneNumber,
                Status: x.IsActive.ToString()
            )).ToList();
            return Result<List<AccountResponse>>.Success(accounts);
        }
    }
}
