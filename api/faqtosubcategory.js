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

const faqtosubcategory = {
  addFaqToSubCategory: asyncHandler(async (req, res) => {
    const body = req.body;

    // Validate sub_category_id
    const subCategoryExists = await commonServices.readSingleData(req, tables.msc, '*', {
      id: body.sub_category_id,
    });

    if (subCategoryExists.length === 0) {
      return resp.cResponse(req, res, resp.BAD_REQUEST, con.faq.SUB_CATEGORY_NOT_FOUND);
    }

    // Validate faq_ids
    const invalidFaqIds = await Promise.all(
      body.faq_ids.map(async (faq_id) => {
        const faqExists = await commonServices.readSingleData(req, tables.mf, '*', { id: faq_id });
        return faqExists.length === 0 ? faq_id : null;
      }),
    ).then((results) => results.filter((id) => id !== null));

    if (invalidFaqIds.length > 0) {
      return resp.cResponse(req, res, resp.BAD_REQUEST, con.faq.FAQ_NOT_FOUND, {
        invalidFaqIds,
      });
    }

    // Insert data one by one
    const results = [];

    for (const faq_id of body.faq_ids) {
      try {
        const existingEntry = await commonServices.readSingleData(req, tables.fsc, '*', {
          faq_id,
          sub_category_id: body.sub_category_id,
        });

        if (existingEntry.length > 0) {
          return resp.cResponse(req, res, resp.PRECONDITION_FAILED, con.faq.FAQ_ALREADY_ADDED);
        }

        const result = await commonServices.dynamicInsert(req, tables.fsc, {
          faq_id,
          sub_category_id: body.sub_category_id,
        });

        if (result && result.insertId) {
          results.push(result.insertId);
        }
      } catch (error) {
        return resp.cResponse(req, res, resp.PRECONDITION_FAILED, con.faq.SOMETHING_WENT_WRONG);
      }
    }
    return resp.cResponse(req, res, resp.CREATED, con.faq.FAQ_CREATED);
  }),

  updateFaqInSubCategory: asyncHandler(async (req, res) => {
    const body = req.body;
    console.log('Request Body:', body);

    // Validate sub_category_id
    const subCategoryExists = await commonServices.readSingleData(req, tables.msc, '*', {
      id: body.sub_category_id,
    });

    if (subCategoryExists.length === 0) {
      return resp.cResponse(req, res, resp.BAD_REQUEST, con.faq.SUB_CATEGORY_NOT_FOUND);
    }

    // Validate faq_ids
    const invalidFaqIds = await Promise.all(
      body.faq_ids.map(async (faq_id) => {
        const faqExists = await commonServices.readSingleData(req, tables.mf, '*', { id: faq_id });
        return faqExists.length === 0 ? faq_id : null;
      }),
    ).then((results) => results.filter((id) => id !== null));

    if (invalidFaqIds.length > 0) {
      return resp.cResponse(req, res, resp.BAD_REQUEST, con.faq.FAQ_NOT_FOUND, {
        invalidFaqIds,
      });
    }

    // Determine FAQs to add and remove
    const existingEntries = await commonServices.readAllData(req, tables.fsc, '*', {
      sub_category_id: body.sub_category_id,
    });

    const currentFaqIds = new Set(existingEntries.map((entry) => entry.faq_id));
    const newFaqIds = new Set(body.faq_ids);

    const faqIdsToAdd = [...newFaqIds].filter((id) => !currentFaqIds.has(id));
    const faqIdsToRemove = [...currentFaqIds].filter((id) => !newFaqIds.has(id));

    console.log('FAQs to Add:', faqIdsToAdd);
    console.log('FAQs to Remove:', faqIdsToRemove);

    // Remove old FAQs
    if (faqIdsToRemove.length > 0) {
      try {
        await Promise.all(
          faqIdsToRemove.map(async (faq_id) => {
            const result = await commonServices.dynamicDelete(req, tables.fsc, {
              faq_id,
              sub_category_id: body.sub_category_id,
            });

            if (result.affectedRows === 0) {
              console.warn(`No rows affected for deletion of FAQ ID: ${faq_id}`);
            }
          }),
        );
      } catch (error) {
        console.error('Error removing FAQ from sub-category:', error);
        return resp.cResponse(req, res, resp.INTERNAL_SERVER_ERROR, con.faq.SOMETHING_WENT_WRONG);
      }
    }

    // Add new FAQs (if necessary)
    if (faqIdsToAdd.length > 0) {
      try {
        await Promise.all(
          faqIdsToAdd.map(async (faq_id) => {
            // Ensure FAQ ID is not already present in the sub-category
            const alreadyExists = await commonServices.readSingleData(req, tables.fsc, '*', {
              faq_id,
              sub_category_id: body.sub_category_id,
            });
            if (alreadyExists.length === 0) {
              const result = await commonServices.dynamicInsert(req, tables.fsc, {
                faq_id,
                sub_category_id: body.sub_category_id,
              });

              if (!result || !result.insertId) {
                throw new Error(`Insertion failed for FAQ ID: ${faq_id}`);
              }
            }
          }),
        );
      } catch (error) {
        console.error('Error adding FAQ to sub-category:', error);
        return resp.cResponse(req, res, resp.INTERNAL_SERVER_ERROR, con.faq.SOMETHING_WENT_WRONG);
      }
    }

    return resp.cResponse(req, res, resp.SUCCESS, con.faq.FAQ_UPDATED);
  }),

  removeFaqFromSubCategory: asyncHandler(async (req, res) => {
    const { sub_category_id, faq_id } = req.body;

    // Validate sub_category_id and faq_id
    const subCategoryExists = await commonServices.readSingleData(req, tables.msc, '*', {
      id: sub_category_id,
    });

    if (subCategoryExists.length === 0) {
      return resp.cResponse(req, res, resp.BAD_REQUEST, con.faq.SUB_CATEGORY_NOT_FOUND);
    }

    const faqExists = await commonServices.readSingleData(req, tables.mf, '*', {
      id: faq_id,
    });

    if (faqExists.length === 0) {
      return resp.cResponse(req, res, resp.BAD_REQUEST, con.faq.FAQ_NOT_FOUND);
    }

    // Check if the FAQ is already associated with the sub-category
    const existingEntry = await commonServices.readSingleData(req, tables.fsc, '*', {
      faq_id,
      sub_category_id,
    });

    if (existingEntry.length === 0) {
      return resp.cResponse(req, res, resp.NOT_FOUND, con.faq.FAQ_NOT_ASSOCIATED);
    }

    try {
      // Remove the FAQ from the sub-category
      const result = await commonServices.dynamicDelete(req, tables.fsc, {
        faq_id,
        sub_category_id,
      });

      if (result.affectedRows === 0) {
        throw new Error('Deletion failed');
      }

      return resp.cResponse(req, res, resp.SUCCESS, con.faq.FAQ_REMOVED);
    } catch (error) {
      console.error('Error removing FAQ from sub-category:', error);
      return resp.cResponse(req, res, resp.PRECONDITION_FAILED, con.faq.SOMETHING_WENT_WRONG);
    }
  }),
};

module.exports = faqtosubcategory;
