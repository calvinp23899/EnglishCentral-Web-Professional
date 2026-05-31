using EnglishCentral.Application.Interfaces;
using IdGen;

namespace EnglishCentral.Infrastructure.Services.CodeGenerator
{
    public sealed class SnowflakeIdGenerator : ICodeGenerator
    {
        private readonly IdGenerator _generator;

        public SnowflakeIdGenerator(IdGenerator generator)
        {
            _generator = generator;
        }

        public long GenerateCode()
        {
            return _generator.CreateId();
        }
    }
}

