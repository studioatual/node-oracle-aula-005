import { body, validationResult } from 'express-validator';
import User from '../models/User';
import validationFormat from '../../utils/validationFormat';

class UserValidation {
  async validateExistEmail(email, { req }) {
    const { id } = req.params;
    try {
      let response;
      if (id) {
        response = await User.where('email', email)
          .where('id', '<>', req.params.id)
          .get();
      } else {
        response = await User.where('email', email).get();
      }
      if (response.rows.length) {
        throw new Error('E-mail already registered.');
      }
      return true;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  validateEqualPassword(password, { req }) {
    if (password !== req.body.password) {
      throw new Error("Password doesn't match.");
    }
    return true;
  }

  validate() {
    const { validateExistEmail, validateEqualPassword } = this;
    return [
      body('name')
        .exists()
        .withMessage('This field is necessary.'),
      body('email')
        .exists()
        .withMessage('This field is necessary.')
        .isEmail()
        .withMessage('E-mail is invalid.')
        .custom(validateExistEmail),
      body('password')
        .exists()
        .withMessage('This field is necessary.')
        .isLength({ min: 6 })
        .withMessage('Minimum 6 characters.'),
      body('passwordConfirmation')
        .exists()
        .withMessage('This field is necessary.')
        .custom(validateEqualPassword),
      body('admin')
        .exists()
        .withMessage('This field is necessary.')
        .isIn([0, 1])
        .withMessage('Only 0 or 1!'),
    ];
  }

  onResult(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: validationFormat(errors) });
    }
    return next();
  }

  async isExist(req, res, next) {
    try {
      const { id } = req.params;
      if (!id) {
        return next();
      }
      const user = await User.find(id);
      if (!user) {
        return res.json({ error: 'User not found!' });
      }
      return next();
    } catch (err) {
      throw new Error(err.message);
    }
  }

  all() {
    return [this.isExist, this.validate(), this.onResult];
  }
}

export default new UserValidation();
