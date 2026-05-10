using EnglishCentral.Application.Interfaces;
using EnglishCentral.Application.Interfaces.Identity;
using EnglishCentral.Infrastructure.Persistence;
using EnglishCentral.Infrastructure.Persistence.Context;
using EnglishCentral.Infrastructure.Persistence.Repositories.Identity;
using EnglishCentral.Infrastructure.Services.Identity;
using EnglishCentral.Infrastructure.Services.Identity.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace EnglishCentral.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddDIInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            #region Database Connection
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));
            #endregion

            #region Repositories DI
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IPasswordService, PasswordService>();
            services.AddScoped<IJwtService, JwtService>();
            services.AddScoped<IRoleRepository, RoleRepository>();
            services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
            #endregion

            #region JWT Setting
            services.Configure<JwtSettings>(configuration.GetSection("JwtSettings"));
            #endregion

            return services;
        }
    }
}
