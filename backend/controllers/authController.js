const crypto = require('crypto');
const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Department = require('../models/Department');
const sendEmail = require('../utils/emailService');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const getFallbackDepartment = async () => {
  let department = await Department.findOne({ code: 'CS' });

  if (!department) {
    department = await Department.findOne();
  }

  if (!department) {
    department = await Department.create({
      name: 'Computer Science',
      code: 'CS',
      description: 'Default department created for new registrations.',
      establishedYear: 2020,
    });
  }

  return department;
};

const normalizeRole = (role) => {
  if (role === 'faculty' || role === 'admin') {
    return role;
  }
  return 'student';
};

const generateUniqueStudentId = async (preferredId) => {
  if (preferredId) {
    const existing = await Student.findOne({ studentId: preferredId });
    if (!existing) {
      return preferredId;
    }
  }

  let counter = await Student.countDocuments();
  let studentId = '';
  let exists = true;

  while (exists) {
    counter += 1;
    studentId = `STU${String(counter).padStart(3, '0')}`;
    exists = await Student.findOne({ studentId });
  }

  return studentId;
};

const generateUniqueFacultyId = async (preferredId) => {
  if (preferredId) {
    const existing = await Faculty.findOne({ facultyId: preferredId });
    if (!existing) {
      return preferredId;
    }
  }

  let counter = await Faculty.countDocuments();
  let facultyId = '';
  let exists = true;

  while (exists) {
    counter += 1;
    facultyId = `FAC${String(counter).padStart(3, '0')}`;
    exists = await Faculty.findOne({ facultyId });
  }

  return facultyId;
};

const buildStudentProfilePayload = async (userId, body) => {
  const department = body.department || (await getFallbackDepartment())._id;
  const enrollmentYear = Number(body.enrollmentYear) || new Date().getFullYear();
  const semester = Math.min(8, Math.max(1, Number(body.semester) || 1));
  const studentId = await generateUniqueStudentId(body.studentId);

  return {
    user: userId,
    studentId,
    department,
    semester,
    batch: body.batch || `${enrollmentYear}-${enrollmentYear + 4}`,
    enrollmentYear,
    dateOfBirth: body.dateOfBirth || new Date('2004-01-01'),
    gender: body.gender || 'Other',
    previousCGPA: Number(body.previousCGPA) || 0,
    enrollmentStatus: 'active',
    riskLevel: 'low',
    riskScore: 0,
  };
};

const buildFacultyProfilePayload = async (userId, body) => {
  const department = body.department || (await getFallbackDepartment())._id;
  const facultyId = await generateUniqueFacultyId(body.facultyId);

  return {
    user: userId,
    facultyId,
    department,
    designation: body.designation || 'Assistant Professor',
    qualification: body.qualification || '',
    specialization: body.specialization || '',
    joiningDate: body.joiningDate || new Date(),
  };
};

exports.register = async (req, res) => {
  try {
    const role = normalizeRole(req.body.role);
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    try {
      if (role === 'student') {
        const studentPayload = await buildStudentProfilePayload(user._id, req.body);
        await Student.create(studentPayload);
      } else if (role === 'faculty') {
        const facultyPayload = await buildFacultyProfilePayload(user._id, req.body);
        await Faculty.create(facultyPayload);
      }
    } catch (profileError) {
      await User.findByIdAndDelete(user._id);
      throw profileError;
    }

    sendTokenResponse(user, 201, res, 'Account created successfully');
  } catch (error) {
    console.error('Register error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A profile with the same unique details already exists',
      });
    }

    if (error.name === 'ValidationError') {
      const firstMessage = Object.values(error.errors)[0]?.message || 'Validation failed';
      return res.status(400).json({
        success: false,
        message: firstMessage,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

exports.login = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is currently inactive',
      });
    }

    user.lastLogin = Date.now();
    await user.save();

    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your registered email address',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a reset link has been prepared.',
      });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const clientBaseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientBaseUrl.replace(/\/$/, '')}/reset-password/${resetToken}`;

    const message = [
      'You requested a password reset for Smart AI Academic Intelligence System.',
      '',
      `Reset your password using this link: ${resetUrl}`,
      '',
      'This link will expire in 10 minutes.',
      'If you did not request this reset, please ignore this email.'
    ].join('\n');

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        message,
      });

      return res.status(200).json({
        success: true,
        message: 'Password reset link sent to your email address.',
      });
    } catch (mailError) {
      if (mailError.code !== 'EMAIL_NOT_CONFIGURED') {
        user.passwordResetToken = undefined;
        user.passwordResetExpire = undefined;
        await user.save({ validateBeforeSave: false });

        return res.status(500).json({
          success: false,
          message: 'Unable to send reset email right now. Please try again later.',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Email service is not configured yet. Use the temporary reset link below for development.',
        resetUrl,
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const password = req.body.password;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a new password',
      });
    }

    const user = await User.findOne({
      passwordResetToken: resetPasswordToken,
      passwordResetExpire: { $gt: Date.now() },
    }).select('+password');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'This reset link is invalid or has expired',
      });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();

    return sendTokenResponse(user, 200, res, 'Password reset successful');
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    let profile = null;
    if (user.role === 'student') {
      profile = await Student.findOne({ user: user._id }).populate('department');
    } else if (user.role === 'faculty') {
      profile = await Faculty.findOne({ user: user._id }).populate('department');
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        profile,
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

const sendTokenResponse = (user, statusCode, res, message) => {
  const token = generateToken(user._id);

  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
  });
};
