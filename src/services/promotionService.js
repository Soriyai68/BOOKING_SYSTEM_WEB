import api from "../utils/api";

export const promotionService = {
 // Get all promotions with pagination and filters
 async getPromotions(params = {}) {
  const backendParams = {
   page: params.page || 1,
   limit: params.limit || 10,
   search: params.search,
   status: params.status,
   startFrom: params.start_from,
   startTo: params.start_to,
   endFrom: params.end_from,
   endTo: params.end_to,
   activeOnly: params.active_only,
   sortBy: params.sort_by || "start_date",
   sortOrder: params.sort_order || "desc",
  };

  // Remove undefined values
  Object.keys(backendParams).forEach((key) => {
   if (backendParams[key] === undefined) {
    delete backendParams[key];
   }
  });

  const response = await api.get("/promotions", { params: backendParams });

  // Backend returns: { success: true, data: { promotions, pagination } }
  if (response.data?.success && response.data?.data) {
   const { promotions, pagination } = response.data.data;
   return {
    data: promotions.map((promotion) => ({
     id: promotion._id,
     code: promotion.code,
     title: promotion.title,
     image_url: promotion.image_url,
     start_date: promotion.start_date,
     end_date: promotion.end_date,
     status: promotion.status,
     created_at: promotion.createdAt,
     updated_at: promotion.updatedAt,
     status_display: promotion.status
      ? promotion.status.charAt(0).toUpperCase() + promotion.status.slice(1)
      : "-",
    })),
    total: pagination.totalCount,
    current_page: pagination.currentPage,
    per_page: pagination.limit,
    total_pages: pagination.totalPages,
    has_next_page: pagination.hasNextPage,
    has_prev_page: pagination.hasPrevPage,
   };
  }

  return response.data;
 },

 // Get single promotion by ID
 async getPromotion(id) {
  const response = await api.get(`/promotions/${id}`);

  if (response.data?.success && response.data?.data?.promotion) {
   const promotion = response.data.data.promotion;
   return {
    id: promotion._id,
    code: promotion.code,
    title: promotion.title,
    image_url: promotion.image_url,
    start_date: promotion.start_date,
    end_date: promotion.end_date,
    status: promotion.status,
    created_at: promotion.createdAt,
    updated_at: promotion.updatedAt,
   };
  }

  return response.data;
 },

 // Create new promotion
 async createPromotion(promotionData) {
  const backendData = {
   code: promotionData.code,
   title: promotionData.title,
   image_url: promotionData.image_url,
   start_date: promotionData.start_date,
   end_date: promotionData.end_date,
   status: promotionData.status || "Inactive",
  };

  // Remove undefined values
  Object.keys(backendData).forEach((key) => {
   if (backendData[key] === undefined) {
    delete backendData[key];
   }
  });

  const response = await api.post("/promotions", backendData);
  return response.data;
 },

 // Update promotion
 async updatePromotion(id, promotionData) {
  const backendData = {
   code: promotionData.code,
   title: promotionData.title,
   image_url: promotionData.image_url,
   start_date: promotionData.start_date,
   end_date: promotionData.end_date,
   status: promotionData.status,
  };

  // Remove undefined values
  Object.keys(backendData).forEach((key) => {
   if (backendData[key] === undefined) {
    delete backendData[key];
   }
  });

  const response = await api.put(`/promotions/${id}`, backendData);
  return response.data;
 },

  // Delete promotion
  async deletePromotion(id) {
    const response = await api.delete(`/promotions/${id}`);
    return response.data;
  },

  // Bulk delete promotions (hard delete)
  async deleteBulkPromotions(promotionIds) {
    const { data } = await api.delete('/promotions/bulk/delete', {
      data: { ids: promotionIds },
    });
    return data;
  },

  // Constants for frontend use
 STATUS_OPTIONS: [
  { value: "Active", label: "Active", color: "#67C23A" },
  { value: "Inactive", label: "Inactive", color: "#909399" },
  { value: "Expired", label: "Expired", color: "#F56C6C" },
 ],

 SORT_OPTIONS: [
  { value: "start_date", label: "Start Date" },
  { value: "end_date", label: "End Date" },
  { value: "code", label: "Code" },
  { value: "status", label: "Status" },
  { value: "createdAt", label: "Created Date" },
  { value: "updatedAt", label: "Updated Date" },
 ],
};