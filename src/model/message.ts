import {DataTypes} from "sequelize";
import {sequelize} from "../db";

export enum MessageState {
    CREATE,
    TRANSFERRED,
    ERROR
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

export const MessageModel = sequelize.define("message", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    messageId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
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
