using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace EnglishCentral.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddDIApplication(this IServiceCollection services)
        {
            services.AddMediatR(cfg =>
                cfg.RegisterServicesFromAssembly(typeof(DependencyInjection).Assembly));

            services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

            return services;
        }
    }
}
