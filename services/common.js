const makeDb = require("../config/db");
const config = require("config").get("database");
const jwtConfig = require("config").get("jwtConfig");
const dbError = require("../handler/errorHandler");
const eventLogger = require("../logger/eventLogger");
const commonHelper = require("../helpers/common");

// var {google} = require('googleapis');

const commonServices = {
    //Returns single record for query
    //table = any table name from which we need to fetch data
    //keys = comma seperated string of table field which we need to get from database
    //condition = basically it is for data filtering, it is an object, in which key is mapped with table field
    //and value with field value
    readSingleData: async (req, table, keys, condition) => {
        const db = makeDb(config);
        try {
            var conditionQuery = "";
            let conditionValues = [];
            for (let element in condition) {
                if (Array.isArray(condition[element])) {
                    conditionQuery +=
                        conditionQuery == "" ? `WHERE ${element} IN(?)` : ` AND ${element} IN(?)`;
                    conditionValues.push(condition[element]);
                } else {
                    conditionQuery += conditionQuery == "" ? `WHERE ${element} = ?` : ` AND ${element} = ?`;
                    conditionValues.push(condition[element]);
                }
            }
            let sql = `SELECT ${keys} FROM ${table} ${conditionQuery} LIMIT 1`;
            commonServices.loggerMessage(req, "readSingleData", sql, conditionValues);
            let result = await db.query(sql, conditionValues);
            return result;
        } catch (error) {
            throw new dbError("Database error", error);
        } finally {
            await db.close();
        }
    },
    readAllData: async (req, table, keys, condition) => {
        const db = makeDb(config);
        try {
            let conditionQuery = "";
            let conditionValues = [];
            for (let element in condition) {
                if (Array.isArray(condition[element])) {
                    conditionQuery += conditionQuery == "" ? `WHERE ${element} IN(?)` : ` AND ${element} IN(?)`;
                } else {
                    conditionQuery += conditionQuery == "" ? `WHERE ${element} = ?` : ` AND ${element} = ?`;
                }
                conditionValues.push(condition[element]);
            }
            let sql = `SELECT ${keys} FROM ${table} ${conditionQuery}`;
            commonServices.loggerMessage(req, "readAllData", sql, conditionValues);
            return await db.query(sql, conditionValues);
        } catch (error) {
            throw new dbError("Database error", error);
        } finally {
            await db.close();
        }
    },
    // For inserting data dynamically
    dynamicInsert: async (req, table, userDetail) => {
        const db = makeDb(config);
        try {
            let sql = `INSERT INTO ${table}(${Object.keys(
                userDetail
            ).toString()}) VALUES (?)`;
            commonServices.loggerMessage(req, "dynamicInsert", sql, [
                Object.values(userDetail),
            ]);

            return await db.query(sql, [Object.values(userDetail)]);
        } catch (error) {
            throw new dbError("Database error", error);
        } finally {
            await db.close();
        }
    },
    // For updating data dynamically
    dynamicUpdate: async (req, table, keys, condition) => {
        const db = makeDb(config);
        try {
            let conditionQuery = "";
            let conditionValues = [];
            let keysQuery = "";
            for (let obj in keys) {
                keysQuery += keysQuery == "" ? `${obj} = ?` : `,${obj} = ?`;
                conditionValues.push(keys[obj]);
            }
            for (let element in condition) {
                if (Array.isArray(condition[element])) {
                    conditionQuery += conditionQuery == "" ? `WHERE ${element} IN(?)` : ` AND ${element} IN(?)`;
                } else {
                    conditionQuery += conditionQuery == "" ? `WHERE ${element} = ?` : ` AND ${element} = ?`;
                }
                conditionValues.push(condition[element]);
            }
            let sql = ` update ${table} SET ${keysQuery} ${conditionQuery} `;
            commonServices.loggerMessage(req, "dynamicUpdate", sql, conditionValues);
            return await db.query(sql, conditionValues);
        } catch (error) {
            throw new dbError("Database error", error);
        } finally {
            await db.close();
        }
    },
    dynamicDelete: async (req, table, condition) => {
        const db = makeDb(config);
        try {
            let conditionQuery = "";
            let conditionValues = [];
            for (let element in condition) {
                conditionQuery +=
                    conditionQuery == "" ? `WHERE ${element} = ?` : ` AND ${element} = ?`;
                conditionValues.push(condition[element]);
            }
            let sql = `DELETE FROM ${table} ${conditionQuery} LIMIT 1`;
            commonServices.loggerMessage(req, "dynamicDelete", sql, conditionValues);

            return await db.query(sql, conditionValues);
        } catch (error) {
            throw new dbError("Database error", error);
        } finally {
            await db.close();
        }
    },
    dynamicDeleteMultiple: async (req, table, condition) => {
        const db = makeDb(config);
        try {
            let conditionQuery = "";
            let conditionValues = [];
            for (let element in condition) {
                if (Array.isArray(condition[element])) {
                    conditionQuery += conditionQuery == "" ? `WHERE ${element} IN(?)` : ` AND ${element} IN(?)`;
                } else {
                    conditionQuery += conditionQuery == "" ? `WHERE ${element} = ?` : ` AND ${element} = ?`;
                }
                conditionValues.push(condition[element]);
            }
            let sql = `DELETE FROM ${table} ${conditionQuery}`;
            commonServices.loggerMessage(req, "dynamicDeleteMultiple", sql, conditionValues);
            return await db.query(sql, conditionValues);
        } catch (error) {
            throw new dbError("Database error", error);
        } finally {
            await db.close();
        }
    },
    getReportingMng: async (req, assigneeId) => {
        const db = makeDb(config);
        try {
            let sql = "SELECT u.user_id,u.user_name,ebd.reporting_manager as reportingManager FROM `users` as u LEFT JOIN employee_basic_detail as ebd ON u.user_id=ebd.user_id WHERE u.user_id= ? ";
            commonServices.loggerMessage(req, "getReportingMng", sql, [assigneeId]);
            return await db.query(sql, [assigneeId]);
        } catch (error) {
            throw new dbError("Database error", error);
        } finally {
            await db.close();
        }
    },
    latestRecord: async (req, name, orgId) => {
        const db = makeDb(config);
        try {
            let sql;
            let result;
            sql = "SELECT user_name,user_email from users where user_name=? AND org_id=? ORDER BY created_at DESC LIMIT 1";
            commonServices.loggerMessage(req, "latestRecord", sql, [name, orgId]);
            result = await db.query(sql, [name, orgId]);
            return result;
        } catch (error) {
            throw new dbError("Database error", error);
        } finally {
            await db.close();
        }
    },
    getSupportExecutiveList: async (req) => {
        const db = makeDb(config);
        try {
            let sql = "SELECT u.id,u.user_id,u.phone_number,ud.users_device_token FROM `users` as u LEFT JOIN users_devices as ud ON ud.user_id=u.id WHERE u.role =2 AND u.user_status='active' AND ud.users_device_token IS NOT NULL ";
            commonServices.loggerMessage(req, "getSupportExecutiveList", sql, []);
            return await db.query(sql, []);
        } catch (error) {
            throw new dbError("Database error", error);
        } finally {
            await db.close();
        }
    },
    getNotificationForInquiryUserId: async (req, pageNumber, pageSize, userId) => {
        const db = makeDb(config);
        try {
            let valueArray = [userId]
            let sql = "SELECT ni.product_id,p.product_name,(SELECT product_image_key FROM product_multiple_images WHERE product_id = p.product_id LIMIT 1) as product_multiple_images,ni.quantity,ni.unit_of_measurement,ni.created_date FROM `notification_inquiry` as ni LEFT JOIN products as p ON ni.product_id=p.id Where ni.user_id=? AND ni.notification_status='passed' ";
            commonServices.loggerMessage(req, "getNotificationForInquiryUserId", sql, valueArray);
            let resultCount = await db.query(sql, valueArray);

            let sqlRead = "SELECT (SELECT COUNT(*) FROM notification_inquiry WHERE is_read = '0' AND user_id =? AND notification_status='passed' ) AS unreadCount,(SELECT COUNT(*) FROM  notification_inquiry  WHERE is_read = '1' AND user_id = ? AND notification_status='passed') AS readCount ";
            commonServices.loggerMessage(req, "getNotificationForInquiryUserId", sqlRead, [userId, userId]);
            let resultRead = await db.query(sqlRead, [userId, userId]);


            if (pageNumber != null && pageSize != null) {
                pageNumber = Number(pageNumber);
                pageSize = Number(pageSize);
                sql += " LIMIT ?,?";
                valueArray.push(offset, pageSize);
            }
            commonServices.loggerMessage(req, "getNotificationForInquiryUserId", sql, valueArray)

            let result = await db.query(sql, valueArray);

            result = await Promise.all(result.map(async (user) => {
                if (user.product_multiple_images && user.product_multiple_images.length > 0) {
                    const url = JSON.parse(user.product_multiple_images);
                    user.product_multiple_images = await s3.createPreSignedUrl(url[0]);
                }
                return user;
            }));

            for (element of result) {
                Object.keys(element).forEach(function (key) {
                    if (element[key] === null) {
                        element[key] = "";
                    }
                })
                element.request_received_time = await commonHelper.DateTimeFormat(element.created_date)
                element.request_received_time_notification = await commonHelper.timeAgo(element.created_date)
            };
            return [resultCount.length, result, resultRead];

        } catch (error) {
            console.log(error)
            throw new dbError("Database error", error);
        } finally {
            await db.close();
        }
    },
    getNotificationForTaskUserId: async (req, pageNumber, pageSize, userId) => {
        const db = makeDb(config);
        try {
            let valueArray = [userId]
            let sql = "SELECT nt.id,nt.task_id,t.subject,t.task_details,l.primary_phone,l.secondary_phone,nt.notification_status,DATE_FORMAT(nt.created_date, '%Y-%m-%d') as created_date,DATE_FORMAT(t.follow_up_date, '%Y-%m-%d') as due_date,nt.is_read FROM `notification_task` as nt LEFT JOIN tasks as t ON t.id= nt.task_id LEFT JOIN leads as l ON l.id = nt.lead_id Where nt.user_id=? AND notification_status='passed' ";
            commonServices.loggerMessage(req, "getNotificationForTaskUserId", sql, valueArray);
            let resultCount = await db.query(sql, valueArray);

            let sqlRead = "SELECT (SELECT COUNT(*) FROM notification_task WHERE is_read = '0' AND user_id =? AND notification_status='passed') AS unreadCount,(SELECT COUNT(*) FROM  notification_task  WHERE is_read = '1' AND user_id = ? AND notification_status='passed') AS readCount ";
            commonServices.loggerMessage(req, "getNotificationForTaskUserId", sqlRead, [userId, userId]);
            let resultRead = await db.query(sqlRead, [userId, userId]);

            if (pageNumber != null && pageSize != null) {
                pageNumber = Number(pageNumber);
                pageSize = Number(pageSize);
                sql += " LIMIT ?,?";
                valueArray.push(offset, pageSize);
            }
            commonServices.loggerMessage(req, "getNotificationForTaskUserId", sql, valueArray)

            let result = await db.query(sql, valueArray);

            for (element of result) {
                Object.keys(element).forEach(function (key) {
                    if (element[key] === null) {
                        element[key] = "";
                    }
                })
                element.request_received_time = await commonHelper.DateTimeFormat(element.created_date)
                element.request_received_time_notification = await commonHelper.timeAgo(element.created_date)
            };
            return [resultCount.length, result, resultRead];

        } catch (error) {
            throw new dbError("Database error", error);
        } finally {
            await db.close();
        }
    },
    rolePermissions: async (req, roleId, moduleName, permission, parentName = null) => {
        const db = makeDb(config);
        try {
            // for permission
            let val = [roleId, moduleName];
            permission += "_permission";
            let sql2 = `SELECT mm.module_name,mm.id,rp.read_permission,mm.permission_type FROM roles_permission as rp LEFT JOIN master_modules as mm ON mm.id = rp.module_id LEFT JOIN master_modules mm2 ON mm2.id = mm.module_id WHERE rp.role_id= ? AND mm.module_code IN(?) AND rp.read_permission='1' `;
            if (parentName != null) {
                sql2 += " AND mm2.module_code = ?";
                val.push(parentName);
            }
            let result = await db.query(sql2, val);
            return result
        } catch (error) {
            throw new dbError("Database error", error);
        } finally {
            await db.close();
        }
    },

    getDataWithSearch: async (req, table, search, column = null) => {
        const db = makeDb(config);
        try {
            let sql = `SELECT * FROM ${table} WHERE 1`;
            if (search) {
                if (column) {
                    sql += ` AND ${column} LIKE ?`;
                } else {
                    throw new Error("Column name is required for search.");
                }
                const conditionValue = `%${search}%`;
                commonServices.loggerMessage(req, "readAllDataForDropdown", sql, conditionValue);
                return await db.query(sql, [conditionValue]);
            } else {
                commonServices.loggerMessage(req, "readAllDataForDropdown", sql);
                return await db.query(sql);
            }
        } catch (error) {
            throw new dbError("Database error", error);
        } finally {
            await db.close();
        }
    },

    loggerMessage: (req, functionName, sql, data) => {
        let userId = "";
        let api = req.url;
        if (req.token) {
            userId = req.token.userId;
        }
        eventLogger.info(
            `\n API:${api}, USERID:${userId}, FUNCTION:${functionName}, PARAMETERS:(${JSON.stringify(
                data
            )}), QUERY:${sql}`
        );
    },

    countEntriesForID: async (req, table, condition) => {
        const db = makeDb(config);
        try {
            var conditionQuery = "";
            let conditionValues = [];
            for (let element in condition) {
                if (Array.isArray(condition[element])) {
                    conditionQuery +=
                        conditionQuery == "" ? `WHERE ${element} IN(?)` : ` AND ${element} IN(?)`;
                    conditionValues.push(condition[element]);
                } else {
                    conditionQuery += conditionQuery == "" ? `WHERE ${element} = ?` : ` AND ${element} = ?`;
                    conditionValues.push(condition[element]);
                }
            }
            let sql = `SELECT COUNT(*) AS entry_count FROM ${table} ${conditionQuery}`;
            commonServices.loggerMessage(req, "countEntriesForID", sql, conditionValues);
            let result = await db.query(sql, conditionValues);
            return result[0].entry_count;
        } catch (error) {
            throw new dbError("Database error", error);
        } finally {
            await db.close();
        }
    },

    readSingleWithoutDeletedData: async (req, table, keys, condition) => {
        const db = makeDb(config);
        try {
            var conditionQuery = "";
            let conditionValues = [];
            for (let element in condition) {
                if (Array.isArray(condition[element])) {
                    conditionQuery +=
                        conditionQuery == "" ? `WHERE ${element} IN(?)` : ` AND ${element} IN(?)`;
                    conditionValues.push(condition[element]);
                } else {
                    conditionQuery += conditionQuery == "" ? `WHERE ${element} = ?` : ` AND ${element} = ?`;
                    conditionValues.push(condition[element]);
                }
            }
            let sql = `SELECT ${keys} FROM ${table} ${conditionQuery} AND deleted_at IS NULL LIMIT 1`;
            commonServices.loggerMessage(req, "readSingleWithoutDeletedData", sql, conditionValues);
            let result = await db.query(sql, conditionValues);
            return result;
        } catch (error) {
            throw new dbError("Database error", error);
        } finally {
            await db.close();
        }
    },


    readAllWithoutDeletedData: async (req, table, keys, condition) => {
        const db = makeDb(config);
        try {
            let conditionQuery = "";
            let conditionValues = [];
            for (let element in condition) {
                if (Array.isArray(condition[element])) {
                    conditionQuery += conditionQuery == "" ? `WHERE ${element} IN(?)` : ` AND ${element} IN(?)`;
                } else {
                    conditionQuery += conditionQuery == "" ? `WHERE ${element} = ?` : ` AND ${element} = ?`;
                }
                conditionValues.push(condition[element]);
            }
            let sql = `SELECT ${keys} FROM ${table} ${conditionQuery} AND deleted_at IS NULL`;
            commonServices.loggerMessage(req, "readAllWithoutDeletedData", sql, conditionValues);
            return await db.query(sql, conditionValues);
        } catch (error) {
            throw new dbError("Database error", error);
        } finally {
            await db.close();
        }
    }

};


module.exports = commonServices;
