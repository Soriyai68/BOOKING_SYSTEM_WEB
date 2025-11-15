import api from "../utils/api.js";

export const invoiceService = {
 // Get all invoices with pagination and filters
 async getInvoices(params = {}) {
  const backendParams = {
   page: params.page || 1,
   limit: params.limit || 10,
   search: params.search,
   userId: params.user_id,
   bookingId: params.booking_id,
   dateFrom: params.date_from,
   dateTo: params.date_to,
   includeDeleted: params.include_deleted || false,
   sortBy: params.sort_by || "createdAt",
   sortOrder: params.sort_order || "desc",
  };

  // remove undefined values
  Object.keys(backendParams).forEach((key) => {
   if (backendParams[key] === undefined) {
    delete backendParams[key];
   }
  });

  const response = await api.get("/invoices", { params: backendParams });
  // Backend returns: { success: true, data: { invoices, pagination } }
  if (response.data?.success && response.data?.data) {
   const { invoices = [], pagination = {} } = response.data.data;
   return {
    data: invoices.map((invoice) => ({
     id: invoice._id,
     invoice_number: invoice.invoice_number,
     user: invoice.user || {},
     booking: invoice.booking || {},
     amount: invoice.amount,
     createdAt: invoice.createdAt,
    })),
    pagination,
   };
  }
  return response.data;
 },

 // Get invoice details by ID
 async getInvoiceById(id) {
  const response = await api.get(`/invoices/${id}`);
  // Backend returns: { success: true, data: invoice }
  if (response.data?.success && response.data?.data) {
   const invoice = response.data.data;
   return {
    id: invoice._id,
    invoice_number: invoice.invoice_number,
    user: invoice.user || {},
    booking: invoice.booking || {},
    amount: invoice.amount,
    createdAt: invoice.createdAt,
   };
  }
  return response.data;
 },
 // Create new invoice
 async createInvoice(invoiceData) {
  const backendData = {
   userId: invoiceData.user_id,
   bookingId: invoiceData.booking_id,
   amount: invoiceData.amount,
  };
  // remove undefined values
  Object.keys(backendData).forEach((key) => {
   if (backendData[key] === undefined) {
    delete backendData[key];
   }
  });
  const response = await api.post("/invoices", backendData);
  return response.data;
 },

 // Update invoice
 async updateInvoice(id, invoiceData) {
  const backendData = {
   userId: invoiceData.user_id,
   bookingId: invoiceData.booking_id,
   amount: invoiceData.amount,
  };
  // remove undefined values
  Object.keys(backendData).forEach((key) => {
   if (backendData[key] === undefined) {
    delete backendData[key];
   }
  });

  const response = await api.put(`/invoices/${id}`, backendData);
  return response.data;
 },

 // Delete invoice
 async deleteInvoice(id) {
  const response = await api.delete('/invoices/${id}');
  return response.data;
 },

 // Force delete invoice
 // async forceDeleteInvoice(id) {
 //  const response = await api.delete(`/invoices/${id}/force-delete`);
 //  return response.data;
 // },

 // Restore deleted invoice
 // async restoreInvoice(id) {
 //  const response = await api.put(`/invoices/${id}/restore`);
 //  return response.data;
 // },

 // Get deleted invoices
 // async getDeletedInvoices(params = {}) {
 //  const backendParams = {
 //   page: params.page || 1,
 //   limit: params.limit || 10,
 //   search: params.search,
 //   userId: params.user_id,
 //   bookingId: params.booking_id,
 //   dateFrom: params.date_from,
 //   dateTo: params.date_to,
 //   sortBy: params.sort_by || "createdAt",
 //   sortOrder: params.sort_order || "desc",
 //  };

 //  const response = await api.get('/invoices/deleted', { params: backendParams });
 //  // Backend returns: { success: true, data: { invoices, pagination } }
 //  if (response.data?.success && response.data?.data) {
 //   const { invoices = [], pagination = {} } = response.data.data;
 //   return {
 //    data: invoices.map((invoice) => ({
 //     id: invoice._id,
 //     invoice_number: invoice.invoice_number,
 //     user: invoice.user || {},
 //     booking: invoice.booking || {},
 //     amount: invoice.amount,
 //     deleted_at: invoice.deletedAt,
 //     created_at: invoice.createdAt,
 //    })),
 //    pagination,
 //   };
 //  }
 //  return response.data;
 // },


 // Get invoice analytics
 async getInvoiceAnalytics() {
  const response = await api.get("/invoices/analytics");
  return response.data;
 },

};