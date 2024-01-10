import {DataTypes, Sequelize} from "sequelize";
import {env} from "../env";

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: `${env.dbPath}/db.sqlite`,
    logging: env.env === 'dev'
});

export enum MessageState {
    CREATE,
    TRANSFERRED
}

export interface Message {
    authorId: string,
    account: string,
    message: string,
    state: MessageState,
    value: string,
    blockNumber?: number,
    txHash?: string
}

export const Message = sequelize.define("message", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    authorId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    account: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    message: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    state: {
        type: DataTypes.INTEGER,
        defaultValue: MessageState.CREATE,
        allowNull: false,
    },
    value: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    blockNumber: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    txHash: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: false,
});

export async function initDb() {
    await sequelize.sync();
}

export async function disconnect() {
    await sequelize.close();
}

