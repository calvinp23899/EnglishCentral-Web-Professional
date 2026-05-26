const PASSWORD_GROUPS = [
  "ABCDEFGHJKLMNPQRSTUVWXYZ",
  "abcdefghijkmnopqrstuvwxyz",
  "23456789",
  "!@#$%&*?",
];

const PASSWORD_LENGTH = 12;

const randomIndex = (max: number) => {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);

  return values[0] % max;
};

const shuffle = (characters: string[]) => {
  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1);
    [characters[index], characters[swapIndex]] = [characters[swapIndex], characters[index]];
  }

  return characters;
};

export const generatePassword = () => {
  const allCharacters = PASSWORD_GROUPS.join("");
  const requiredCharacters = PASSWORD_GROUPS.map((group) => group[randomIndex(group.length)]);
  const remainingCharacters = Array.from(
    { length: PASSWORD_LENGTH - requiredCharacters.length },
    () => allCharacters[randomIndex(allCharacters.length)],
  );

  return shuffle([...requiredCharacters, ...remainingCharacters]).join("");
};
