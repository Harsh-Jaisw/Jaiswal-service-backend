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
const userServices = require('../services/users');

const tables = {
  users: 'users',
  mr: 'master_roles',
  mc: 'master_category',
  msc: 'master_subcategories',
  mf: 'master_faq',
  fsc: 'faq_subcategory',
};
const common = {
  getRoles: asyncHandler(async (req, res) => {
    let result = await commonServices.readAllData(req, tables.mr, '*', {
      isActive: 1,
    });

    if (result.length > 0) {
      return resp.cResponse(req, res, resp.SUCCESS, con.common.SUCCESS, {
        records: result,
      });
    }

    return resp.cResponse(req, res, resp.SUCCESS, con.common.NO_RECORD, {
      records: [],
    });
  }),

  getCategory: asyncHandler(async (req, res) => {
    let result = await commonServices.readAllData(req, tables.mc, '*', {
      is_active: 'Active',
    });

    if (result.length > 0) {
      return resp.cResponse(req, res, resp.SUCCESS, con.common.SUCCESS, {
        records: result,
      });
    }

    return resp.cResponse(req, res, resp.SUCCESS, con.common.NO_RECORD, {
      records: [],
    });
  }),

  // getSubCategory: asyncHandler(async (req, res) => {
  //     const body = req.body
  //     console.log(body)
  //     let result = await commonServices.readAllData(req, tables.msc, '*', {
  //         category_id: body.category_id,
  //         is_active: 'Active',
  //     });

  //     if (result.length > 0) {
  //         return resp.cResponse(req, res, resp.SUCCESS, con.common.SUCCESS, {
  //             records: result,
  //         })
  //     }
  //     return resp.cResponse(req, res, resp.SUCCESS, con.common.NO_RECORD, {
  //         records: [],
  //     })
  // }),

  getSubCategory: asyncHandler(async (req, res) => {
    const body = req.body;
    console.log('Request Body:', body);

    // Fetch all active subcategories for the given category_id
    const subcategories = await commonServices.readAllData(req, tables.msc, '*', {
      category_id: body.category_id,
      is_active: 'Active',
    });

    if (subcategories.length === 0) {
      return resp.cResponse(req, res, resp.SUCCESS, con.common.NO_RECORD, {
        records: [],
      });
    }

    // Prepare to fetch FAQs for each subcategory
    const subcategoryIds = subcategories.map((subcat) => subcat.id);

    // Fetch all faq_ids related to the retrieved subcategories
    const faqAssociations = await commonServices.readAllData(req, tables.fsc, '*', {
      sub_category_id: subcategoryIds,
    });

    // Extract faq_ids from the associations
    const faqIds = faqAssociations.map((fa) => fa.faq_id);

    // Fetch detailed FAQs from the master_faq table
    const faqs = await commonServices.readAllData(req, tables.mf, '*', {
      id: faqIds,
    });

    // Organize FAQs by subcategory
    const faqsBySubcategory = faqAssociations.reduce((acc, faqAssoc) => {
      if (!acc[faqAssoc.sub_category_id]) {
        acc[faqAssoc.sub_category_id] = [];
      }
      const faqDetail = faqs.find((f) => f.id === faqAssoc.faq_id);
      if (faqDetail) {
        acc[faqAssoc.sub_category_id].push(faqDetail);
      }
      return acc;
    }, {});

    // Combine subcategories with their FAQs
    const subcategoryWithFaqs = subcategories.map((subcat) => ({
      ...subcat,
      faqs: faqsBySubcategory[subcat.id] || [],
    }));

    return resp.cResponse(req, res, resp.SUCCESS, con.common.SUCCESS, {
      records: subcategoryWithFaqs,
    });
  }),

  getUsers: asyncHandler(async (req, res) => {
    const body = req.body;
    const { userId } = req.token;

    // Check if the user has the right role
    let result = await commonServices.readSingleData(req, tables.users, '*', { id: userId });
    if (result[0].role != 3) {
      return resp.cResponse(req, res, resp.BAD_REQUEST, con.middleware.AUTHORIZATION_FAILED_NO_PERMISSION);
    }

    // Construct the searchSortFilter object
    let searchSortFilter = {
      role: body.role || '',
      status: body.status || '',
      search: body.search || '',
      sortBy: body.sortBy || 'firstName',
      sortOrder: body.sortOrder || 'asc'
    };

    // Fetch users with pagination
    const pageNumber = body.pageNumber || 1;
    const pageSize = body.pageSize || 10;

    const usersData = await userServices.getUsers(req, pageNumber, pageSize, searchSortFilter);

    if (usersData.users.length > 0) {
      return resp.cResponse(req, res, resp.SUCCESS, con.common.SUCCESS, {
        records: usersData.users,
        total: usersData.total,
        page: usersData.page,
        limit: usersData.limit
      });
    } else {
      return resp.cResponse(req, res, resp.SUCCESS, con.common.NO_RECORD, {
        records: [],
        total: 0,
        page: pageNumber,
        limit: pageSize
      });
    }
  }),

};

module.exports = common;
