import {DataTypes, Sequelize} from "sequelize";
import {env} from "../env";

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: `${env.dbPath}/db.sqlite`,
    logging: env.env === 'dev'
});


export async function initDb() {
    await sequelize.sync();
}

export async function disconnect() {
    await sequelize.close();
}

