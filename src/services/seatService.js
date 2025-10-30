import api from "@/utils/api";

export const seatService = {
    // Get all seats with pagination and filters
    async getSeats(params = {}) {
        // Convert frontend params to backend format
        const backendParams = {
            page: params.page || 1,
            limit: params.per_page || 10,
            search: params.search,
            seat_type: params.seat_type,
            status: params.status,
            row: params.row,
            sortBy: params.sort_by || "row",
            sortOrder: params.sort_order || "asc",
            hall_id: params.hall_id,
            theater_id: params.theater_id,
        };

        // Remove undefined values
        Object.keys(backendParams).forEach((key) => {
            if (backendParams[key] === undefined) {
                delete backendParams[key];
            }
        });

        const response = await api.get("/seats", {params: backendParams});

        // Backend returns: { success: true, data: { seats, pagination } }
        if (response.data?.success && response.data?.data) {
            const {seats, pagination} = response.data.data;
            return {
                data: seats.map((seat) => {
                    // Handle multi-seat display
                    const seatNumbers = Array.isArray(seat.seat_number) ? seat.seat_number : [seat.seat_number];
                    const seatIdentifier = seatNumbers.map(num => `${seat.row}${num}`).join(', ');
                    const displayName = seatNumbers.length > 1
                        ? `Seats ${seat.row}${seatNumbers.join(', ')} (${seat.seat_type})`
                        : `Seat ${seat.row}${seat.seat_number} (${seat.seat_type})`;

                    return {
                        id: seat._id,
                        row: seat.row,
                        seat_number: seat.seat_number,
                        seat_type: seat.seat_type,
                        status: seat.status,
                        price: seat.price || 0,
                        notes: seat.notes || "",
                        created_at: seat.createdAt,
                        updated_at: seat.updatedAt,
                        seat_identifier: seatIdentifier,
                        display_name: displayName,
                        is_multi_seat: Array.isArray(seat.seat_number),
                        seat_count: seatNumbers.length,
                        hall: seat.hall_id
                            ? {id: seat.hall_id._id, hall_name: seat.hall_id.hall_name}
                            : null,
                        theater: seat.hall_id?.theater_id
                            ? {
                                id: seat.hall_id.theater_id._id,
                                name: seat.hall_id.theater_id.name,
                            }
                            : null,
                    };
                }),
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

    // Get single seat by ID
    async getSeat(id) {
        const response = await api.get(`/seats/${id}`);

        if (response.data?.success && response.data?.data?.seat) {
            const seat = response.data.data.seat;

            // Handle multi-seat display for single seat retrieval
            const seatNumbers = Array.isArray(seat.seat_number) ? seat.seat_number : [seat.seat_number];
            const seatIdentifier = seatNumbers.map(num => `${seat.row}${num}`).join(', ');
            const displayName = seatNumbers.length > 1
                ? `Seats ${seat.row}${seatNumbers.join(', ')} (${seat.seat_type})`
                : `Seat ${seat.row}${seat.seat_number} (${seat.seat_type})`;

            return {
                id: seat._id,
                row: seat.row,
                seat_number: seat.seat_number,
                seat_type: seat.seat_type,
                status: seat.status,
                price: seat.price || 0,
                notes: seat.notes || "",
                created_at: seat.createdAt,
                updated_at: seat.updatedAt,
                seat_identifier: seatIdentifier,
                display_name: displayName,
                is_multi_seat: Array.isArray(seat.seat_number),
                seat_count: seatNumbers.length,
                hall_id: seat.hall_id?._id,
                hall: seat.hall_id
                    ? {id: seat.hall_id._id, hall_name: seat.hall_id.hall_name}
                    : null,
                theater: seat.hall_id?.theater_id
                    ? {
                        id: seat.hall_id.theater_id._id,
                        name: seat.hall_id.theater_id.name,
                    }
                    : null,
            };
        }

        return response.data;
    },

    // Create new seat
    async createSeat(seatData) {
        // Convert frontend format to backend format
        let seatNumber = seatData.seat_number;

        // Handle multi-seat arrays
        if (Array.isArray(seatNumber)) {
            seatNumber = seatNumber.map(s => s.toString().toUpperCase());
        } else if (typeof seatNumber === 'string') {
            seatNumber = seatNumber.toString().toUpperCase();
        }

        const backendData = {
            hall_id: seatData.hall_id,
            row: seatData.row?.toUpperCase(),
            seat_number: seatNumber,
            seat_type: seatData.seat_type || "regular",
            status: seatData.status || "active",
            price: seatData.price || 0,
            notes: seatData.notes || "",
        };

        const response = await api.post("/seats", backendData);
        return response.data;
    },

    // Update seat
    async updateSeat(id, seatData) {
        // Convert frontend format to backend format
        let seatNumber = seatData.seat_number;

        // Handle multi-seat arrays
        if (Array.isArray(seatNumber)) {
            seatNumber = seatNumber.map(s => s.toString().toUpperCase());
        } else if (typeof seatNumber === 'string' && seatNumber) {
            seatNumber = seatNumber.toString().toUpperCase();
        }

        const backendData = {
            hall_id: seatData.hall_id,
            row: seatData.row?.toUpperCase(),
            seat_number: seatNumber,
            seat_type: seatData.seat_type,
            status: seatData.status,
            price: seatData.price,
            notes: seatData.notes,
        };

        // Remove undefined values
        Object.keys(backendData).forEach((key) => {
            if (backendData[key] === undefined) {
                delete backendData[key];
            }
        });

        const response = await api.put(`/seats/${id}`, backendData);
        return response.data;
    },
    // Delete seat (soft delete)
    // async deleteSeat(id) {
    //   const response = await api.delete(`/seats/${id}`);
    //   return response.data;
    // },
    //delete seat (force delete)
    async deleteSeat(id) {
        const response = await api.delete(`/seats/${id}/force-delete`);
        return response.data;
    },
    // bulk force delete seats
    async bulkForceDeleteSeats(seatIds) {
        const {data} = await api.delete(`/seats/bulk/force-delete`, {
            data: {seatIds},
        });
        return data;
    },

    // Toggle seat availability
    async toggleSeatAvailability(id) {
        const response = await api.put(`/seats/${id}/toggle`);
        return response.data;
    },

    // Get available seats
    async getAvailableSeats(params = {}) {
        const response = await api.get("/seats/available", {params});
        return response.data;
    },

    // Get seats by type
    async getSeatsByType(type, params = {}) {
        const response = await api.get(`/seats/type/${type}`, {params});
        return response.data;
    },

    // Get seats by theater
    async getSeatsByTheater(theaterId, params = {}) {
        const allParams = {
            ...params,
            theater_id: theaterId,
        };
        return await this.getSeats(allParams);
    },

    // Get seats by hall
    async getSeatsByHall(hallId, params = {}) {
        const allParams = {
            ...params,
            hall_id: hallId,
        };
        return await this.getSeats(allParams);
    },

    // Update seat status
    async updateSeatStatus(seatId, status) {
        const response = await api.put(`/seats/${seatId}/status`, {status});
        return response.data;
    },

    // Bulk create seats
    async bulkCreateSeats(seatData) {
        const backendData = {
            hall_id: seatData.hall_id,
            row: seatData.row,
            seat_type: seatData.seat_type,
            price: seatData.price,
            range: seatData.range,
        };

        Object.keys(backendData).forEach((key) => {
            if (backendData[key] === undefined) {
                delete backendData[key];
            }
        });

        const {data} = await api.post(`/seats/bulk/create-seats`, backendData);
        return data;
    }
};
