import bcrypt from 'bcryptjs';
import Model from './Model';

class User extends Model {
  constructor() {
    super();
    this.table = 'users';
    this.fillable = ['name', 'email', 'password', 'admin'];
    this.hidden = ['password'];
  }

  async create(body) {
    const password = await bcrypt.hash(body.password, 8);
    return super.create({ ...body, password });
  }

  async update(body) {
    const password = await bcrypt.hash(body.password, 8);
    return super.update({ ...body, password });
  }
}

export default new User();
