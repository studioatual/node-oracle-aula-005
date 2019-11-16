import keysToLowerCase from '../../utils/keysToLowerCase';

class Model {
  constructor() {
    this.pool = null;
    this.options = {};
    this.table = null;
    this.fillable = [];
    this.hidden = [];
    this.body = {};
    this.wQuery = '';
  }

  init(pool, options) {
    this.pool = pool;
    this.options = options;
  }

  async close(conn) {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.log(err);
      }
    }
  }

  async all() {
    let conn;
    try {
      conn = await this.pool.getConnection();
      const query = `select ${this.selectFields()} from ${this.table}`;
      const response = await conn.execute(query);
      return keysToLowerCase(response);
    } catch (err) {
      throw new Error(err.message);
    } finally {
      this.close(conn);
    }
  }

  selectFields() {
    this.fillable.push('created_at');
    this.fillable.push('updated_at');
    const lista = this.fillable.filter(f => !this.hidden.includes(f));
    let fields = 'id';
    lista.forEach(item => {
      fields += `,${item}`;
    });
    return fields;
  }

  async find(id) {
    let conn;
    try {
      conn = await this.pool.getConnection();
      const query = `select ${this.selectFields()} from ${
        this.table
      } where id = :id`;
      const response = await conn.execute(query, { id });
      if (response.rows.length) {
        return keysToLowerCase(response)[0];
      }
      return null;
    } catch (err) {
      throw new Error(err.message);
    } finally {
      this.close(conn);
    }
  }

  async create(body) {
    let conn;
    try {
      this.body = {};
      this.fillable.forEach(item => {
        if (body[item]) {
          this.body[item] = body[item];
        }
      });
      const query = this.createQuery();
      conn = await this.pool.getConnection();
      const response = await conn.execute(
        query,
        {
          ...this.body,
          id: {
            dir: this.options.BIND_OUT,
            type: this.options.NUMBER,
          },
        },
        {
          autoCommit: true,
        }
      );
      if (response.rowsAffected && response.rowsAffected === 1) {
        const [id] = response.outBinds.id;
        const result = await conn.execute(
          `select ${this.selectFields()} from ${this.table} where id = :id`,
          { id }
        );
        return keysToLowerCase(result)[0];
      }
      throw new Error('Insert has been failed.');
    } catch (err) {
      throw new Error(err.message);
    } finally {
      this.close(conn);
    }
  }

  createQuery() {
    let query = `insert into ${this.table} ( id, `;
    this.fillable.forEach(item => {
      if (this.body[item]) {
        query += `${item}, `;
      }
    });
    query += `created_at ) values (`;
    query += `(select nvl(max(id), 0) + 1 from ${this.table}),`;
    this.fillable.forEach(item => {
      if (this.body[item]) {
        query += `:${item},`;
      }
    });
    query += 'localtimestamp) returning id into :id';
    return query;
  }

  async update(body) {
    let conn;
    try {
      this.body = {};
      this.fillable.forEach(item => {
        if (body[item]) {
          this.body[item] = body[item];
        }
      });
      const { id } = body;
      const query = this.updateQuery();
      conn = await this.pool.getConnection();
      const response = await conn.execute(
        query,
        { ...this.body, id },
        {
          autoCommit: true,
        }
      );
      if (response.rowsAffected && response.rowsAffected === 1) {
        const result = await conn.execute(
          `select ${this.selectFields()} from ${this.table} where id = :id`,
          { id }
        );
        return keysToLowerCase(result)[0];
      }
      throw new Error('Update has been failed.');
    } catch (err) {
      throw new Error(err.message);
    } finally {
      this.close(conn);
    }
  }

  updateQuery() {
    let query = `update ${this.table} set `;
    this.fillable.forEach(item => {
      if (this.body[item]) {
        query += `${item} = :${item}, `;
      }
    });
    query += `updated_at = localtimestamp `;
    query += `where id = :id`;
    return query;
  }

  async delete(id) {
    let conn;
    try {
      const query = `delete from ${this.table} where id = :id`;
      conn = await this.pool.getConnection();
      const response = await conn.execute(
        query,
        { id },
        {
          autoCommit: true,
        }
      );
      if (response.rowsAffected && response.rowsAffected === 1) {
        return { result: 'ok' };
      }
      throw new Error('Delete has been failed.');
    } catch (err) {
      throw new Error(err.message);
    } finally {
      this.close(conn);
    }
  }

  where(x, y = null, z = null) {
    if (!Array.isArray(x)) {
      this.whereString(x, y, z);
      return this;
    }
    if (!Array.isArray(x[0])) {
      const [a, b, c] = x;
      this.whereString(a, b, c);
    } else {
      x.forEach(obj => {
        const [d, e, f] = obj;
        this.whereString(d, e, f);
      });
    }
    return this;
  }

  whereString(x, y = null, z = null) {
    let query;
    if (z) {
      query = `${x.trim()} ${y.trim()} '${z.trim()}'`;
      this.wQuery += !this.wQuery ? `${query}` : ` AND ${query}`;
    } else {
      query = `${x.trim()} = '${y.trim()}'`;
      this.wQuery += !this.wQuery ? `${query}` : ` AND ${query}`;
    }
  }

  async get() {
    let conn;
    try {
      const query =
        this.wQuery === ''
          ? `select ${this.selectFields()} from ${this.table}`
          : `select ${this.selectFields()} from ${this.table} where ${
              this.wQuery
            }`;
      conn = await this.pool.getConnection();
      this.wQuery = '';
      return await conn.execute(query);
    } catch (err) {
      throw new Error(err.message);
    } finally {
      this.close(conn);
    }
  }

  async custom(query, params = {}) {
    let conn;
    try {
      conn = await this.pool.getConnection();
      return await conn.execute(query, params);
    } catch (err) {
      throw new Error(err.message);
    } finally {
      this.close(conn);
    }
  }
}

export default Model;
