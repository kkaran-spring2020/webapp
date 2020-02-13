const owasp = require('owasp-password-strength-test');
owasp.config({
  allowPassphrases: false,
  maxLength: 128,
  minLength: 8
});
const bcrypt = require('bcrypt');

const auth = require('basic-auth');

const PasswordStrength = password => {
  const passwordTest = owasp.test(password);
  if (passwordTest.strong == false) {
    throw new Error(passwordTest.errors[0]);
  }
};

const getPasswordHash = password => {
  return password;
};

const validateAndGetUser = async (req, User) => {
  const creds = auth(req);
  if (!creds || !creds.name || !creds.pass) {
    throw new Error('Invalid Credentials');
  }
  const user = await User.findOne({
    where: {
      email_address: creds.name
    }
  });
  if (!user) {
    throw new Error('User Not Found');
  }
  const getPasswordHash = await bcrypt.compare(
      creds.pass,
      user.password
  );
  if (!getPasswordHash){
    throw new Error('Invalid Credentials');
  }

  return user;
};
module.exports = {
  PasswordStrength,
  getPasswordHash,
  validateAndGetUser
};
