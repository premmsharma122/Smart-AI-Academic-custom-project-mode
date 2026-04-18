const validateEmail = (email) => {
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const validatePhone = (phone) => {
  const re = /^[0-9]{10}$/;
  return re.test(phone);
};

const validateStudentId = (id) => {
  const re = /^[A-Z0-9]{6,12}$/;
  return re.test(id);
};

module.exports = {
  validateEmail,
  validatePhone,
  validateStudentId
};