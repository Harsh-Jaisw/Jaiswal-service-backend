const asyncHandler = require('../helpers/catch-async');
const resp = require('../helpers/response');
const con = require('../constants/index');
const commonServices = require('../services/common');
const nodemailer = require('nodemailer');
const moment = require('moment');
const helper = require('../helpers/common');
const uuid = require('uuid');
const jwtConfig = require('config').get('jwtConfig');
const app = require('config');
const jwt = require('jsonwebtoken');

const tables = {
  users: 'users',
  mr: 'master_roles',
  mc: 'master_category',
  msc: 'master_subcategories',
  mf: 'master_faq',
  fsc: 'faq_subcategory',
};

const subcategory = {
  addSubCategory: asyncHandler(async (req, res) => {
    const body = req.body;

    // Check if file details are available
    if (req.fileDetails) {
      const { original, small, large } = req.fileDetails;

      // Check if the category already exists
      const existingCategory = await commonServices.readSingleData(req, tables.msc, '*', {
        service_name: body.service_name,
      });

      if (existingCategory.length > 0) {
        return resp.cResponse(req, res, resp.BAD_REQUEST, con.category.SUB_CATEGORY_EXISTS);
      }

      // Prepare data for insertion
      const data = {
        service_name: body.service_name,
        category_id: body.category_id,
        icon: small,
        service_cost: body.service_cost,
        description: body.service_description,
        est_time: body.est_time,
        rating: body.rating,
        is_active: 'Active',
      };

      // Insert new sub-category
      const insertData = await commonServices.dynamicInsert(req, tables.msc, data);

      // Process FAQ IDs
      let faqIds = body.faq_ids;

      // Ensure faqIds is an array
      if (typeof faqIds === 'string') {
        // Handle case where faq_ids is a JSON string or incorrectly formatted string
        try {
          // Remove unwanted characters and parse the JSON if necessary
          faqIds = faqIds.replace(/'/g, '"'); // Replace single quotes with double quotes for JSON parsing
          faqIds = JSON.parse(faqIds); // Try to parse JSON
        } catch (e) {
          // Fallback to splitting by comma if JSON parsing fails
          faqIds = faqIds.split(',').map((id) => id.trim());
        }
      }

      // Ensure faqIds is an array of strings
      faqIds = Array.isArray(faqIds) ? faqIds.map((id) => id.toString().trim()) : [];

      console.log('Processed FAQ IDs:', faqIds);

      if (faqIds.length > 0) {
        // Check for each FAQ ID if it exists in the master_faq table
        const invalidFaqIds = await commonServices.readAllData(req, tables.mf, 'id', {
          id: faqIds,
        });

        const validFaqIds = invalidFaqIds.map((faq) => faq.id);

        if (validFaqIds.length !== faqIds.length) {
          console.error(
            'Some FAQ IDs do not exist:',
            faqIds.filter((id) => !validFaqIds.includes(id)),
          );
          return resp.cResponse(req, res, resp.BAD_REQUEST, 'Some FAQ IDs do not exist');
        }

        // Insert valid FAQ IDs into the subcategory
        const faqInsertPromises = validFaqIds.map((id) => {
          console.log(`Inserting FAQ with ID: ${id}`);
          return commonServices.dynamicInsert(req, tables.fsc, {
            sub_category_id: insertData?.insertId,
            faq_id: id,
          });
        });

        try {
          await Promise.all(faqInsertPromises);
          console.log('All FAQs inserted successfully');
        } catch (error) {
          console.error('Error inserting FAQs:', error.message);
          return resp.cResponse(req, res, resp.BAD_REQUEST, 'Failed to insert FAQs');
        }
      } else {
        console.warn('FAQ IDs is not an array or is not provided');
        // Optionally handle the case where faq_ids is not an array
      }

      // Respond with success
      if (insertData) {
        return resp.cResponse(req, res, resp.SUCCESS, con.category.SUB_CATEGORY_ADDED, {
          inserted_Id: insertData?.insertId,
          icon: small,
        });
      } else {
        return resp.cResponse(req, res, resp.BAD_REQUEST, con.common.SOMETHING_WRONG);
      }
    } else {
      return resp.cResponse(req, res, resp.BAD_REQUEST, 'Image upload failed');
    }
  }),

  updateSubCategory: asyncHandler(async (req, res) => {
    const body = req.body;

    // Ensure the required fields are provided
    if (!body.category_id) {
      return resp.cResponse(req, res, resp.BAD_REQUEST, 'Category ID is required.');
    }

    // Check if file details are available and set the icon path
    let iconPath = null;
    if (req.fileDetails) {
      const { small } = req.fileDetails;
      iconPath = small;
    }

    // Prepare data for update
    const data = {};
    if (body.service_name) data.service_name = body.service_name;
    if (iconPath) data.icon = iconPath;
    if (body.service_cost) data.service_cost = body.service_cost;
    if (body.service_description) data.description = body.service_description;
    if (body.est_time) data.est_time = body.est_time;
    if (body.rating) data.rating = body.rating;
    if (body.is_active) data.is_active = body.is_active;

    // If no data to update, skip update operation
    if (Object.keys(data).length === 0) {
      return resp.cResponse(req, res, resp.BAD_REQUEST, 'No update data provided.');
    }

    try {
      // Update the subcategory
      const updateResult = await commonServices.dynamicUpdate(req, tables.msc, data, { id: body.category_id });
      if (updateResult.affectedRows === 0) {
        return resp.cResponse(req, res, resp.NOT_FOUND, 'Subcategory not found.');
      }

      // Process FAQ IDs
      let faqIds = body.faq_ids;

      // Utility function to process FAQ IDs
      if (typeof faqIds === 'string') {
        try {
          faqIds = faqIds.replace(/'/g, '"');
          faqIds = JSON.parse(faqIds);
        } catch (e) {
          faqIds = faqIds.split(',').map((id) => id.trim());
        }
      }
      faqIds = Array.isArray(faqIds) ? faqIds.map((id) => id.toString().trim()) : [];

      if (faqIds.length > 0) {
        // Utility function to validate FAQ IDs
        const invalidFaqIds = await commonServices.readAllData(req, tables.mf, 'id', { id: faqIds });
        const validFaqIds = invalidFaqIds.map((faq) => faq.id);

        if (validFaqIds.length !== faqIds.length) {
          console.error(
            'Some FAQ IDs do not exist:',
            faqIds.filter((id) => !validFaqIds.includes(id)),
          );
          return resp.cResponse(req, res, resp.BAD_REQUEST, 'Some FAQ IDs do not exist.');
        }

        // Fetch existing FAQ IDs for the subcategory
        const existingFaqs = await commonServices.readAllData(req, tables.fsc, 'faq_id', { sub_category_id: body.category_id });
        const existingFaqIds = existingFaqs.map((faq) => faq.faq_id);

        // Determine FAQ IDs to remove and add
        const faqIdsToRemove = existingFaqIds.filter((id) => !validFaqIds.includes(id));
        const faqIdsToAdd = validFaqIds.filter((id) => !existingFaqIds.includes(id));

        if (faqIdsToRemove.length > 0) {
          // Remove old FAQs that are no longer valid
          await commonServices.dynamicDeleteMultiple(req, tables.fsc, {
            sub_category_id: body.category_id,
            faq_id: faqIdsToRemove,
          });
        }

        if (faqIdsToAdd.length > 0) {
          // Insert only new FAQ IDs
          const faqInsertPromises = faqIdsToAdd.map(async (id) => {
            try {
              return await commonServices.dynamicInsert(req, tables.fsc, { sub_category_id: body.category_id, faq_id: id });
            } catch (err) {
              console.error(`Failed to insert FAQ with ID: ${id}`, err.message);
              throw err;
            }
          });

          try {
            await Promise.all(faqInsertPromises);
            console.log('New FAQs inserted successfully.');
          } catch (error) {
            console.error('Error inserting FAQs:', error.message);
            return resp.cResponse(req, res, resp.BAD_REQUEST, 'Failed to insert FAQs.');
          }
        } else {
          console.log('No new FAQs to add.');
        }
      } else {
        console.warn('No FAQ IDs provided or FAQ IDs is not an array.');
      }

      // Respond with success
      return resp.cResponse(req, res, resp.SUCCESS, con.category.SUB_CATEGORY_UPDATED, {
        updated_Id: body.category_id,
        icon: iconPath,
      });
    } catch (error) {
      console.error('Error updating subcategory:', error.message);
      return resp.cResponse(req, res, resp.BAD_REQUEST, error.message);
    }
  }),

  deleteSubCategory: asyncHandler(async (req, res) => {
    const body = req.body;
    const existingCategory = await commonServices.readSingleData(req, tables.msc, '*', {
      id: body.category_id,
    });

    if (existingCategory.length == 0) {
      return resp.cResponse(req, res, resp.SUCCESS, con.category.SUB_CATEGORY_NOT_FOUND);
    }

    await commonServices.dynamicDelete(req, tables.msc, { id: body.category_id });
    await commonServices.dynamicDeleteMultiple(req, tables.fsc, { sub_category_id: body.category_id });

    return resp.cResponse(req, res, resp.SUCCESS, con.category.SUB_CATEGORY_DELETED);
  }),
};

module.exports = subcategory;
