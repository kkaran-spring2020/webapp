const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  'kelvin',
  'root',
  '12345678',
  {
    host: 'localhost',
    port: 3306,
    dialect: 'mysql',
    //storage: 'app.db'
  }
);

class User extends Sequelize.Model {}

User.init(
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true
    },
    first_name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    last_name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    email_address: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      isEmail: true
    }
  },
  {
    sequelize,
    timestamps: true,
    updatedAt: 'account_updated',
    createdAt: 'account_created'
  }
);

class Bill extends Sequelize.Model {}

Bill.init(
  {
    id: {
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true
    },
    vendor: {
      type: Sequelize.STRING,
      allowNull: false
    },
    bill_date: {
      type: Sequelize.DATE,
      allowNull: false
    },
    due_date: {
      type: Sequelize.DATE,
      allowNull: false
    },
    payment_status: {
      type: Sequelize.ENUM({
        values: [
          'paid',
          'due',
          'past_due',
          'no_payment_required'
        ]
      }),
      allowNull: false
    },
    categories: {
      type: Sequelize.JSON
    },
    amount_due: {
      type: Sequelize.DOUBLE,
      validate: { min: 0.01, max: 1000000 },
      allowNull: false
    }
  },
  {
    sequelize,
    timestamps: true,
    updatedAt: 'created_at',
    createdAt: 'updated_at'
  }
);
User.hasMany(Bill, { as: 'bills' });
const init = async () => {
  await sequelize.authenticate();
  await sequelize.sync();
};

module.exports = { User, Bill, init };