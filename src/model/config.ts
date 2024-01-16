import {sequelize} from "../db";
import {DataTypes} from "sequelize";
import * as _ from "lodash";

export const ConfigModel = sequelize.define("config", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    config_key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    config_value: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    timestamps: false,
});

export async function getConfig(key: string): Promise<string | null> {
    const config = await ConfigModel.findAll({
        where: {
            config_key: key,
        },
        limit: 1
    });
    return config.length > 0 ? config.at(0).getDataValue('config_value') : null;
}

export async function upsertConfig(key: string, value: string) {
    const exist = await getConfig(key);
    if (exist) {
        return ConfigModel.update({ config_value: value},
            {
                where: {
                    config_key: key
                }
            });
    } else {
        return ConfigModel.create({
            config_key: key,
            config_value: value
        });
    }
}
