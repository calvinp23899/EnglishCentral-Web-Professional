using EnglishCentral.API.Middlewares;
using EnglishCentral.Application;
using EnglishCentral.Infrastructure;
using EnglishCentral.Infrastructure.Extensions;
using EnglishCentral.Infrastructure.Services.Identity.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using System.Text;

namespace EnglishCentral.API
{
    public class Program
    {
        public static async Task Main(string[] args)
        {

            var builder = WebApplication.CreateBuilder(args);
            Log.Logger = new LoggerConfiguration()
                .ReadFrom.Configuration(builder.Configuration)
                .WriteTo.Console()
                .CreateLogger();
            builder.Host.UseSerilog();
            // Add services to the container.

            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Services.AddDIApplication();
            builder.Services.AddDIInfrastructure(builder.Configuration);
            var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>()!;
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = jwtSettings.Issuer,
                        ValidAudience = jwtSettings.Audience,
                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(jwtSettings.SecretKey)
                        )
                    };
                });
            builder.Services.AddAuthorization();

            var app = builder.Build();
            app.UseMiddleware<ExceptionHandlingMiddleware>();
            app.UseSerilogRequestLogging();
            await app.Services.SeedDatabaseAsync();
            // Configure the HTTP request pipeline.
            app.UseSwagger();
            app.UseSwaggerUI();

            app.UseHttpsRedirection();

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
