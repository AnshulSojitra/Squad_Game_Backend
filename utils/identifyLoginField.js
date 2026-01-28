exports.identifyLoginField = (input) => {
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
  const isPhone = /^[0-9]{10}$/.test(input); // adjust country

  if (isEmail) return { type: "email", value: input };
  if (isPhone) return { type: "phone", value: input };

  return null;
};
