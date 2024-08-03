const makeDb = require('../config/db');
const config = require('config').get('database');
const dbError = require('../handler/errorHandler');
const eventLogger = require('../logger/eventLogger');
const commonHelper = require('../helpers/common');
const commonServices = require('./common');

const userServices = {
     getUsers : async (req, pageNumber, pageSize, searchSortFilter) => {
        const db = makeDb(config);
        try {
            let valueArray = [];
            let offset = Number((pageNumber - 1) * pageSize);
    
            // Base query
            let sql = `
                SELECT 
                    u.id, u.uid, u.firstName, u.lastName, u.email, u.mobileNumber, 
                    u.profileImage, u.status, u.role, u.level, u.createdAt, u.updatedAt, 
                    mr.name AS roleName 
                FROM users AS u 
                LEFT JOIN master_roles AS mr ON mr.id = u.role 
                WHERE 1=1
            `;
    
            // Add filters
            if (searchSortFilter) {
                if (searchSortFilter.role) {
                    sql += " AND mr.name = ? ";
                    valueArray.push(searchSortFilter.role);
                }
                // if (searchSortFilter.status) {
                //     sql += " AND u.status = ? ";
                //     valueArray.push(searchSortFilter.status);
                // }
                if (searchSortFilter.search) {
                    sql += ` AND (u.firstName LIKE ? OR u.lastName LIKE ? OR u.email LIKE ? OR u.mobileNumber LIKE ?) `;
                    const searchValue = `%${searchSortFilter.search}%`;
                    valueArray.push(searchValue, searchValue, searchValue, searchValue);
                }
            }
    
            // Sorting
            if (searchSortFilter.sortBy && ['firstName', 'email', 'mobileNumber'].includes(searchSortFilter.sortBy)) {
                sql += ` ORDER BY u.${searchSortFilter.sortBy} ${searchSortFilter.sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
            } else {
                sql += ' ORDER BY u.firstName ASC';
            }
    
            // Pagination
            if (pageNumber != null && pageSize != null) {
                sql += " LIMIT ?,?";
                valueArray.push(offset, pageSize);
            }
    
            commonServices.loggerMessage(req, "getUsers", sql, valueArray);
    
            // Execute main query
            let result = await db.query(sql, valueArray);
    
            // Get total count
            let countSql = `
                SELECT COUNT(*) AS total
                FROM users AS u 
                LEFT JOIN master_roles AS mr ON mr.id = u.role 
                WHERE 1=1
            `;
    
            // Reuse valueArray but without LIMIT/OFFSET
            let countValues = valueArray.slice(0, valueArray.length - 2); 
    
            if (searchSortFilter) {
                if (searchSortFilter.role) {
                    countSql += " AND mr.name = ? ";
                    countValues.push(searchSortFilter.role);
                }
                //if (searchSortFilter.status) {
                //     countSql += " AND u.status = ? ";
                //     countValues.push(searchSortFilter.status);
                // }
                if (searchSortFilter.search) {
                    countSql += ` AND (u.firstName LIKE ? OR u.lastName LIKE ? OR u.email LIKE ? OR u.mobileNumber LIKE ?) `;
                    const searchValue = `%${searchSortFilter.search}%`;
                    countValues.push(searchValue, searchValue, searchValue, searchValue);
                }
            }
    
            let countResult = await db.query(countSql, countValues);
            const totalCount = countResult[0].total;
    
            return {
                users: result,
                total: totalCount,
                page: Number(pageNumber),
                limit: Number(pageSize)
            };
        } catch (error) {
            console.error('Error getting users:', error);
            throw new dbError("Database error", error);
        } finally {
            await db.close();
        }
    }
    
    

};

module.exports = userServices;
