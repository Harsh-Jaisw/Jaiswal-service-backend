const makeDb = require('../config/db');
const config = require('config').get('database');
const dbError = require('../handler/errorHandler');
const eventLogger = require('../logger/eventLogger');
const commonHelper = require('../helpers/common');
const commonServices = require('./common');

const subcategoryservice = {
  getAllSubCategories: async ({ pageNumber, pageSize, category_id, search, sortBy, sortOrder }) => {
    const db = makeDb(config);
    try {
      // Ensure pagination values are numbers
      const pageNumberInt = parseInt(pageNumber, 10);
      const pageSizeInt = parseInt(pageSize, 10);
      const offset = (pageNumberInt - 1) * pageSizeInt;

      // Base query for subcategories
      let subcategorySql = `
                SELECT 
                    ms.id AS subcategory_id, 
                    ms.category_id, 
                    ms.service_name, 
                    ms.icon, 
                    ms.service_cost, 
                    ms.description, 
                    ms.est_time, 
                    ms.rating, 
                    ms.is_active,
                    c.category_name
                FROM master_subcategories AS ms
                LEFT JOIN master_category AS c ON ms.category_id = c.id
                WHERE 1=1
            `;

      // Add filters
      let subcategoryValues = [];
      if (category_id) {
        subcategorySql += ' AND ms.category_id = ? ';
        subcategoryValues.push(category_id);
      }

      if (search) {
        subcategorySql += ` AND (ms.service_name LIKE ? OR ms.description LIKE ?) `;
        const searchValue = `%${search}%`;
        subcategoryValues.push(searchValue, searchValue);
      }

      // Sorting
      if (sortBy) {
        const validSortBy = ['service_name', 'service_cost', 'rating', 'est_time'];
        if (validSortBy.includes(sortBy)) {
          subcategorySql += ` ORDER BY ms.${sortBy} ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
        } else {
          subcategorySql += ' ORDER BY ms.service_name ASC'; // Default sorting
        }
      } else {
        subcategorySql += ' ORDER BY ms.service_name ASC'; // Default sorting
      }

      // Pagination
      if (pageNumberInt != null && pageSizeInt != null) {
        subcategorySql += ' LIMIT ?, ?';
        subcategoryValues.push(offset, pageSizeInt);
      }

      // Execute subcategory query
      const subcategories = await db.query(subcategorySql, subcategoryValues);

      // Extract subcategory IDs
      const subcategoryIds = subcategories.map((subcat) => subcat.subcategory_id);

      // Query to get FAQs
      let faqSql = `
                SELECT 
                    fs.sub_category_id AS subcategory_id,
                    f.id AS faq_id,
                    f.question,
                    f.answer
                FROM faq_subcategory AS fs
                JOIN master_faq AS f ON fs.faq_id = f.id
                WHERE fs.sub_category_id IN (?)
            `;

      // Execute FAQ query
      const faqs = await db.query(faqSql, [subcategoryIds]);

      // Combine subcategories with their FAQs
      const subcategoryMap = subcategories.reduce((map, subcategory) => {
        map[subcategory.subcategory_id] = { ...subcategory, faqs: [] };
        return map;
      }, {});

      faqs.forEach((faq) => {
        if (subcategoryMap[faq.subcategory_id]) {
          subcategoryMap[faq.subcategory_id].faqs.push({
            id: faq.faq_id,
            question: faq.question,
            answer: faq.answer,
          });
        }
      });

      const result = Object.values(subcategoryMap);

      // Total count query
      let countSql = `
                SELECT COUNT(DISTINCT ms.id) AS total
                FROM master_subcategories AS ms
                LEFT JOIN master_category AS c ON ms.category_id = c.id
                WHERE 1=1
            `;

      // Reuse valueArray but without LIMIT/OFFSET
      let countValues = [...subcategoryValues];

      if (category_id) {
        countSql += ' AND ms.category_id = ? ';
        countValues.push(category_id);
      }

      if (search) {
        countSql += ` AND (ms.service_name LIKE ? OR ms.description LIKE ?) `;
        const searchValue = `%${search}%`;
        countValues.push(searchValue, searchValue);
      }

      const countResult = await db.query(countSql, countValues);
      const totalCount = countResult[0].total;

      return {
        subCategories: result,
        total: totalCount,
        page: Number(pageNumberInt),
        limit: Number(pageSizeInt),
      };
    } catch (error) {
      console.error('Error getting subcategories:', error);
      throw new Error('Database error');
    } finally {
      await db.close();
    }
  },
};

module.exports = subcategoryservice;
