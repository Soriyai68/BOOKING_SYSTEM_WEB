
import api from "@/utils/api";

export const bookingDetailService = {
 // Get all booking details with pagination and filters
 async getBookingDetails(params = {}) {
  const backendParams = {
   page: params.page || 1,
   limit: params.limit || 10,
   search: params.search,
   bookingId: params.booking_id,
   seatId: params.seat_id,
   seat_type: params.seat_type,
   row_label: params.row_label,
   includeDeleted: params.include_deleted || false,
   sortBy: params.sort_by || "createdAt",
   sortOrder: params.sort_order || "desc",
  };

  Object.keys(backendParams).forEach((key) => {
   if (backendParams[key] === undefined) {
    delete backendParams[key];
   }
  });

  const response = await api.get("/booking-details", { params: backendParams });

  if (response.data?.success && response.data?.data) {
   const { bookingDetails, pagination } = response.data.data;
   return {
    data: bookingDetails.map((detail) => ({
     id: detail._id,
     booking: detail.bookingId || {},
     seat: detail.seatId || {},
     row_label: detail.row_label,
     seat_number: detail.seat_number,
     seat_type: detail.seat_type,
     price: detail.price,
     created_at: detail.createdAt,
     updated_at: detail.updatedAt,
     deleted_at: detail.deletedAt,
     is_deleted: !!detail.deletedAt,
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

 // Get single booking detail by ID
 async getBookingDetail(id) {
  const response = await api.get(`/booking-details/${id}`);
  if (response.data?.success && response.data?.data?.bookingDetail) {
   const detail = response.data.data.bookingDetail;
   return {
    id: detail._id,
    booking: detail.bookingId || {},
    seat: detail.seatId || {},
    row_label: detail.row_label,
    seat_number: detail.seat_number,
    seat_type: detail.seat_type,
    price: detail.price,
    created_at: detail.createdAt,
    updated_at: detail.updatedAt,
   };
  }
  return response.data;
 },

 // Get all booking details for a specific booking
 async getBookingDetailsByBookingId(bookingId) {
  const response = await api.get(`/booking-details/booking/${bookingId}`);
  if (response.data?.success && response.data?.data?.bookingDetails) {
   return response.data.data.bookingDetails.map((detail) => ({
    id: detail._id,
    booking: detail.bookingId || {},
    seat: detail.seatId || {},
    row_label: detail.row_label,
    seat_number: detail.seat_number,
    seat_type: detail.seat_type,
    price: detail.price,
   }));
  }
  return [];
 },

 // Create new booking detail
 async createBookingDetail(detailData) {
  const backendData = {
   bookingId: detailData.booking_id,
   seatId: detailData.seat_id,
   row_label: detailData.row_label,
   seat_number: detailData.seat_number,
   seat_type: detailData.seat_type,
   price: detailData.price,
  };
  const response = await api.post("/booking-details", backendData);
  return response.data;
 },

 // Create multiple booking details
 async createBulkBookingDetails(bulkData) {
  const backendData = {
   bookingId: bulkData.booking_id,
   seats: bulkData.seats.map(seat => ({
    seatId: seat.seat_id,
    row_label: seat.row_label,
    seat_number: seat.seat_number,
    seat_type: seat.seat_type,
    price: seat.price,
   })),
  };
  const response = await api.post("/booking-details/bulk", backendData);
  return response.data;
 },

 // Update booking detail
 async updateBookingDetail(id, detailData) {
  const backendData = {
   bookingId: detailData.booking_id,
   seatId: detailData.seat_id,
   row_label: detailData.row_label,
   seat_number: detailData.seat_number,
   seat_type: detailData.seat_type,
   price: detailData.price,
  };
  Object.keys(backendData).forEach((key) => {
   if (backendData[key] === undefined) {
    delete backendData[key];
   }
  });
  const response = await api.put(`/booking-details/${id}`, backendData);
  return response.data;
 },

 // Delete booking detail (soft delete)
 async deleteBookingDetail(id) {
  const response = await api.delete(`/booking-details/${id}`);
  return response.data;
 },

 // Delete multiple booking details
 async deleteBulkBookingDetails(ids) {
  const response = await api.delete("/booking-details/bulk", { data: { ids } });
  return response.data;
 },

 // Force delete booking detail (permanent)
 async forceDeleteBookingDetail(id) {
  const response = await api.delete(`/booking-details/${id}/force-delete`);
  return response.data;
 },

 // Restore deleted booking detail
 async restoreBookingDetail(id) {
  const response = await api.put(`/booking-details/${id}/restore`);
  return response.data;
 },

 // Get deleted booking details
 async getDeletedBookingDetails(params = {}) {
  const backendParams = {
   page: params.page || 1,
   limit: params.limit || 10,
   sortBy: params.sort_by || "deletedAt",
   sortOrder: params.sort_order || "desc",
  };

  const response = await api.get("/booking-details/deleted", { params: backendParams });

  if (response.data?.success && response.data?.data) {
   const { bookingDetails, pagination } = response.data.data;
   return {
    data: bookingDetails.map((detail) => ({
     id: detail._id,
     booking: detail.bookingId || {},
     seat: detail.seatId || {},
     row_label: detail.row_label,
     seat_number: detail.seat_number,
     seat_type: detail.seat_type,
     price: detail.price,
     deleted_at: detail.deletedAt,
    })),
    total: pagination.totalCount,
    current_page: pagination.currentPage,
    per_page: pagination.limit,
    total_pages: pagination.totalPages,
   };
  }
  return response.data;
 },

 // Constants
 SEAT_TYPES: [
  { value: "Standard", label: "Standard" },
  { value: "VIP", label: "VIP" },
  { value: "Premium", label: "Premium" },
  { value: "Couple", label: "Couple" },
 ],

 SORT_OPTIONS: [
  { value: "row_label", label: "Row" },
  { value: "seat_number", label: "Seat Number" },
  { value: "seat_type", label: "Seat Type" },
  { value: "price", label: "Price" },
  { value: "createdAt", label: "Created Date" },
 ],
};
