import oracledb from 'oracledb';
import config from '../config/database';
import User from '../app/models/User';

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const models = [User];

class Database {
  constructor() {
    this.init();
  }

  async init() {
    try {
      const pool = await oracledb.createPool(config);
      models.map(model =>
        model.init(pool, {
          BIND_OUT: oracledb.BIND_OUT,
          NUMBER: oracledb.NUMBER,
        })
      );
    } catch (err) {
      throw new Error('Open pool is failed!');
    }
  }

  async close() {
    await oracledb.getPool().close();
  }
}

export default new Database();
