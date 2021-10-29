const Service = require('egg').Service;

class UserService extends Service {
  // 默认不需要提供构造函数。
  // constructor(ctx) {
  //   super(ctx); 如果需要在构造函数做一些处理，一定要有这句话，才能保证后面 `this.ctx`的使用。
  //   // 就可以直接通过 this.ctx 获取 ctx 了
  //   // 还可以直接通过 this.app 获取 app 了
  // }
  async find(id) {
    // 假如 我们拿到用户 id 从数据库获取用户详细信息
    const user = await this.ctx.db.query('select * from user where id = ?', id);

    // 假定这里还有一些复杂的计算，然后返回需要的信息。
    const picture = await this.getPicture(uid);

    return {
      name: user.user_name,
      age: user.age,
      picture,
    };
  }

  async create() {
    // 插入
    const result = await this.app.mysql.insert('user', { age: 25, firstName: 'Timber', lastName: 'Saw' });
    // 判断插入成功
    const insertSuccess = result.affectedRows === 1;
    return insertSuccess;
  }

  async read(id) {
    //SELECT * FROM `user` WHERE `id` = 12 LIMIT 0, 1;
    const getOne = await this.app.mysql.get('user', { id: 12 });
    //SELECT * FROM `user`;
    const getAll = await this.app.mysql.select('user');

    //SELECT `firstName`, `lastName` FROM `user` WHERE `firstName` = 'Timber' AND `lastName` IN('a','b') ORDER BY `age` DESC, `id` DESC LIMIT 0, 10;
    const results = await this.app.mysql.select('user', { // 搜索 post 表
      where: { firstName: 'Timber', lastName: ['a', 'b'] }, // WHERE 条件
      columns: ['firstName', 'lastName'], // 要查询的表字段
      orders: [['age', 'desc'], ['id', 'desc']], // 排序方式
      limit: 10, // 返回数据量
      offset: 0, // 数据偏移量
    });
  }

  async update() {
    const row = {
      id: 1,
      age: 22,
      firstName: 'a',
      lastName: 'b',
      //time: this.app.mysql.literals.now, // `now()` on db server
    };
    const result = await this.app.mysql.update('user', row); // 更新 user 表中的记录
    
    // UPDATE `user` SET `age` = 22, `firstName` = 'a', `lastName` = 'b' WHERE id = 1 ;
    
    // 判断更新成功
    const updateSuccess = result.affectedRows === 1;

    const row2 = {
      age: 22,
      firstName: 'a',
      lastName: 'b',
    };
    
    const options = {
      where: {
        custom_id: 1
      }
    };
    const result2 = await this.app.mysql.update('user', row2, options); // 更新 user 表中的记录
    
    // UPDATE `user` SET `age` = 22, `firstName` = 'a', `lastName` = 'b' WHERE id = 1 ;
    
    // 判断更新成功
    const updateSuccess2 = result2.affectedRows === 1;

    return updateSuccess && updateSuccess2;
  }

  async delete(id) {
    const result = await this.app.mysql.delete('user', {
      firstName: 'a',
    });
    
    // DELETE FROM `user` WHERE `firstName` = 'a';
  }

  async getPicture(id) {
    const result = await this.ctx.curl(`http://localhost:7001/api/posts/${id}`, { dataType: 'json' });
    return result.data;
  }

  async get(name) {
    return name;
  }
}

module.exports = UserService;