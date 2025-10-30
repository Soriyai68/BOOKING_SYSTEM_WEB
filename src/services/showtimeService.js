import api from "@/utils/api";

export const showtimeService = {
    // List showtimes with pagination and filters
    async getShowtimes(params = {}) {
        const backendParams = {
            page: params.page || 1,
            limit: params.per_page || 10,
            search: params.search,
            status: params.status,
            movie_id: params.movie_id,
            hall_id: params.hall_id,
            theater_id: params.theater_id,
            show_date: params.show_date,
            dateFrom: params.date_from,
            dateTo: params.date_to,
            includeDeleted: params.include_deleted || false,
            sortBy: params.sort_by || "start_time",
            sortOrder: params.sort_order || "asc",
        };

        Object.keys(backendParams).forEach(
            (k) => backendParams[k] === undefined && delete backendParams[k]
        );

        const {data} = await api.get("/showtimes", {params: backendParams});
        if (data?.success && data?.data) {
            const {showtimes, pagination} = data.data;
            return {
                data: showtimes.map((s) => ({
                    id: s._id,
                    movie_id: s.movie?._id,
                    movie_title: s.movie?.title,
                    movie_poster: s.movie?.poster_url,
                    duration_minutes: s.movie?.duration_minutes,
                    hall_id: s.hall?._id,
                    hall_name: s.hall?.hall_name,
                    screen_type: s.hall?.screen_type,
                    theater_id: s.theater?._id,
                    theater_name: s.theater?.name,
                    theater_city: s.theater?.city,
                    theater_province: s.theater?.province,
                    start_time: s.start_time,
                    show_date: new Date(s.show_date).toLocaleDateString(),
                    end_time: s.end_time,
                    status: s.status,
                    created_at: s.createdAt,
                    updated_at: s.updatedAt,
                })),
                total: pagination.totalCount,
                current_page: pagination.currentPage,
                per_page: pagination.limit,
                total_pages: pagination.totalPages,
            };
        }
        console.log("data from showtime service:", data);
        return data;
    },

    // Get a single showtime by ID
    async getShowtime(id) {
        const {data} = await api.get(`/showtimes/${id}`);
        if (data?.success && data?.data?.showtime) {
            const s = data.data.showtime;
            return {
                id: s._id,
                movie_id: s.movie?._id,
                movie_title: s.movie?.title,
                movie_poster: s.movie?.poster_url,
                duration_minutes: s.movie?.duration_minutes,
                hall_id: s.hall?._id,
                hall_name: s.hall?.hall_name,
                screen_type: s.hall?.screen_type,
                theater_id: s.theater?._id,
                theater_name: s.theater?.name,
                theater_city: s.theater?.city,
                theater_province: s.theater?.province,
                start_time: s.start_time,
                end_time: s.end_time,
                show_date: new Date(s.show_date).toLocaleDateString(),
                status: s.status,
                language: s.language,
                subtitle: s.subtitle,
                created_by: s.createdBy,
                updated_by: s.updatedBy,
                created_at: s.createdAt,
                updated_at: s.updatedAt,
                deleted_at: s.deletedAt,
            };
        }
        return data;
    },

    // Create a showtime
    async createShowtime(payload) {
        const backendData = {
            movie_id: payload.movie_id,
            hall_id: payload.hall_id,
            theater_id: payload.theater_id,
            show_date: payload.show_date,
            start_time: payload.start_time,
            end_time: payload.end_time,
            status: payload.status || "scheduled",
        };
        Object.keys(backendData).forEach(
            (k) => backendData[k] === undefined && delete backendData[k]
        );
        const {data} = await api.post("/showtimes", backendData);
        return data;
    },
    // showtimeService.js
    async createBulkShowtimes(payload) {
        // payload: { showtimes: [ { movie_id, hall_id, theater_id, show_date, start_time, end_time, status } ] }
        const backendData = {
            showtimes: payload.showtimes.map((s) => {
                const data = {
                    movie_id: s.movie_id,
                    hall_id: s.hall_id,
                    theater_id: s.theater_id,
                    show_date: s.show_date,
                    start_time: s.start_time,
                    end_time: s.end_time,
                    status: s.status || "scheduled",
                };
                // Remove undefined fields
                Object.keys(data).forEach(
                    (k) => data[k] === undefined && delete data[k]
                );
                return data;
            }),
        };
        const {data} = await api.post("/showtimes/bulk/create", backendData);
        return data;
    },

    // Update a showtime
    async updateShowtime(id, payload) {
        const backendData = {
            movie_id: payload.movie_id,
            hall_id: payload.hall_id,
            show_date: payload.show_date,
            theater_id: payload.theater_id,
            start_time: payload.start_time,
            end_time: payload.end_time,
            status: payload.status,
        };
        Object.keys(backendData).forEach(
            (k) => backendData[k] === undefined && delete backendData[k]
        );
        const {data} = await api.put(`/showtimes/${id}`, backendData);
        return data;
    },

    // duplicate bluk showtimes
    async duplicateBulkShowtimes(payload) {
        if (!payload?.showtimes?.length) {
            throw new Error("No showtimes provided for duplication");
        }

        const backendData = {
            showtimes: payload.showtimes.map((s) => ({
                _id: s._id,
                movie_id: s.movie_id,
                hall_id: s.hall_id,
                theater_id: s.theater_id,
                show_date: s.show_date,
                start_time: s.start_time,
                end_time: s.end_time,
                status: s.status,
            })),
        };
        const {data} = await api.post("/showtimes/bulk/duplicate", backendData);
        return data;
    },
    // Soft delete a showtime
    async deleteShowtime(id) {
        const {data} = await api.delete(`/showtimes/${id}/force-delete`);
        return data;
    },

    // Bulk delete showtimes (soft-delete)
    async deleteBulkShowtimes(showtimeIds) {
        const {data} = await api.delete("/showtimes/bulk/delete", {
            data: {showtimeIds},
        });
        return data;
    },

    // Bulk force delete showtimes (permanent)
    async forceDeleteBulkShowtimes(showtimeIds) {
        const {data} = await api.delete("/showtimes/bulk/force-delete", {
            data: {showtimeIds},
        });
        return data;
    },

    // Force delete (permanent)
    async forceDeleteShowtime(id) {
        const {data} = await api.delete(`/showtimes/${id}/force-delete`);
        return data;
    },

    // Restore a soft-deleted showtime
    async restoreShowtime(id) {
        const {data} = await api.put(`/showtimes/${id}/restore`);
        return data;
    },

    // Update showtime status
    async updateStatus(id, status) {
        const {data} = await api.put(`/showtimes/${id}/status`, {status});
        return data;
    },

    // Get deleted showtimes
    async getDeletedShowtimes(params = {}) {
        const backendParams = {
            page: params.page || 1,
            limit: params.per_page || 10,
        };
        const {data} = await api.get("/showtimes/deleted", {
            params: backendParams,
        });
        return data;

    },
    async getAnalytics(params = {}) {
        const {data} = await api.get("/showtimes/analytics", {params});
        return data;
    },
    STATUS_OPTIONS: [
        {value: "scheduled", label: "Scheduled"},
        {value: "completed", label: "Completed"},
        {value: "cancelled", label: "Cancelled"},
    ],
    LANGUAGE_OPTIONS: [
        {value: "EN", label: "English"},
        {value: "KH", label: "Khmer"},
        {value: "JP", label: "Japanese"},
        {value: "CN", label: "Chinese"},
    ],

    SUBTITLE_OPTIONS: [
        {value: "EN", label: "English"},
        {value: "KH", label: "Khmer"},
    ],
};
