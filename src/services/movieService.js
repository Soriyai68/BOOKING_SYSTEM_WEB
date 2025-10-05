import api from '@/utils/api'

export const movieService = {
  // Constants
  MOVIE_STATUSES: [
    { value: 'coming_soon', label: 'Coming Soon' },
    { value: 'now_showing', label: 'Now Showing' },
    { value: 'ended', label: 'Ended' }
  ],

  MOVIE_GENRES: [
    { value: 'action', label: 'Action' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'animation', label: 'Animation' },
    { value: 'comedy', label: 'Comedy' },
    { value: 'crime', label: 'Crime' },
    { value: 'documentary', label: 'Documentary' },
    { value: 'drama', label: 'Drama' },
    { value: 'family', label: 'Family' },
    { value: 'fantasy', label: 'Fantasy' },
    { value: 'horror', label: 'Horror' },
    { value: 'mystery', label: 'Mystery' },
    { value: 'romance', label: 'Romance' },
    { value: 'sci-fi', label: 'Sci-Fi' },
    { value: 'thriller', label: 'Thriller' },
    { value: 'war', label: 'War' },
    { value: 'western', label: 'Western' }
  ],

  SORT_OPTIONS: [
    { value: 'title', label: 'Title' },
    { value: 'release_date', label: 'Release Date' },
    { value: 'rating', label: 'Rating' },
    { value: 'duration_minutes', label: 'Duration' },
    { value: 'createdAt', label: 'Created Date' }
  ],

  // Get all movies with pagination and filters
  async getMovies(params = {}) {
    const backendParams = {
      page: params.page || 1,
      limit: params.per_page || 10,
      search: params.search,
      status: params.status,
      genre: params.genre,
      language: params.language,
      minRating: params.min_rating,
      maxRating: params.max_rating,
      minDuration: params.min_duration,
      maxDuration: params.max_duration,
      dateFrom: params.date_from,
      dateTo: params.date_to,
      includeDeleted: params.include_deleted || false,
      sortBy: params.sort_by || 'release_date',
      sortOrder: params.sort_order || 'desc'
    }

    // Remove undefined values
    Object.keys(backendParams).forEach(key => {
      if (backendParams[key] === undefined) {
        delete backendParams[key]
      }
    })

    const response = await api.get('/movies', { params: backendParams })

    if (response.data?.success && response.data?.data) {
      const { movies, pagination } = response.data.data
      return {
        data: movies.map(movie => ({
          id: movie._id,
          title: movie.title,
          description: movie.description || '',
          genres: movie.genres || [],
          languages: movie.languages || [],
          duration_minutes: movie.duration_minutes,
          duration_display: movie.duration_display || this.formatDuration(movie.duration_minutes),
          release_date: movie.release_date,
          release_date_formatted: movie.release_date_formatted || (movie.release_date ? new Date(movie.release_date).toLocaleDateString() : ''),
          end_date: movie.end_date,
          rating: movie.rating || 0,
          poster_url: movie.poster_url,
          trailer_url: movie.trailer_url,
          cast: movie.cast || [],
          director: movie.director || '',
          producers: movie.producers || [],
          status: movie.status,
          status_display: this.getStatusLabel(movie.status),
          notes: movie.notes || '',
          created_at: movie.createdAt,
          updated_at: movie.updatedAt,
          deleted_at: movie.deletedAt,
          is_deleted: !!movie.deletedAt
        })),
        total: pagination.totalCount,
        current_page: pagination.currentPage,
        per_page: pagination.limit,
        total_pages: pagination.totalPages,
        has_next_page: pagination.hasNextPage,
        has_prev_page: pagination.hasPrevPage
      }
    }

    return response.data
  },

  // Get single movie by ID
  async getMovie(id) {
    const response = await api.get(`/movies/${id}`)

    if (response.data?.success && response.data?.data?.movie) {
      const movie = response.data.data.movie
      return {
        id: movie._id,
        title: movie.title,
        description: movie.description || '',
        genres: movie.genres || [],
        languages: movie.languages || [],
        duration_minutes: movie.duration_minutes,
        duration_display: movie.duration_display || this.formatDuration(movie.duration_minutes),
        release_date: movie.release_date,
        release_date_formatted: movie.release_date_formatted || (movie.release_date ? new Date(movie.release_date).toLocaleDateString() : ''),
        end_date: movie.end_date,
        rating: movie.rating || 0,
        poster_url: movie.poster_url,
        trailer_url: movie.trailer_url,
        cast: movie.cast || [],
        director: movie.director || '',
        producers: movie.producers || [],
        status: movie.status,
        status_display: this.getStatusLabel(movie.status),
        notes: movie.notes || '',
        created_at: movie.createdAt,
        updated_at: movie.updatedAt,
        deleted_at: movie.deletedAt,
        is_deleted: !!movie.deletedAt
      }
    }

    return response.data
  },

  // Get now showing movies
  async getNowShowing(params = {}) {
    const backendParams = {
      page: params.page || 1,
      limit: params.per_page || 10
    }

    const response = await api.get('/movies/now-showing', { params: backendParams })

    if (response.data?.success && response.data?.data) {
      const { movies, pagination } = response.data.data
      return {
        data: movies.map(movie => this.transformMovie(movie)),
        ...pagination
      }
    }

    return response.data
  },

  // Get coming soon movies
  async getComingSoon(params = {}) {
    const backendParams = {
      page: params.page || 1,
      limit: params.per_page || 10
    }

    const response = await api.get('/movies/coming-soon', { params: backendParams })

    if (response.data?.success && response.data?.data) {
      const { movies, pagination } = response.data.data
      return {
        data: movies.map(movie => this.transformMovie(movie)),
        ...pagination
      }
    }

    return response.data
  },

  // Get movies by genre
  async getByGenre(genre, params = {}) {
    const backendParams = {
      page: params.page || 1,
      limit: params.per_page || 10
    }

    const response = await api.get(`/movies/genre/${genre}`, { params: backendParams })

    if (response.data?.success && response.data?.data) {
      const { movies, pagination } = response.data.data
      return {
        data: movies.map(movie => this.transformMovie(movie)),
        ...pagination
      }
    }

    return response.data
  },

  // Create new movie
  async createMovie(movieData) {
    const backendData = {
      title: movieData.title?.trim(),
      description: movieData.description || '',
      genres: movieData.genres || [],
      languages: movieData.languages || [],
      duration_minutes: movieData.duration_minutes,
      release_date: movieData.release_date,
      end_date: movieData.end_date || null,
      rating: movieData.rating || 0,
      poster_url: movieData.poster_url || null,
      trailer_url: movieData.trailer_url || null,
      cast: movieData.cast || [],
      director: movieData.director || '',
      producers: movieData.producers || [],
      status: movieData.status || 'coming_soon',
      notes: movieData.notes || ''
    }

    // Remove null/undefined values
    Object.keys(backendData).forEach(key => {
      if (backendData[key] === null || backendData[key] === undefined) {
        delete backendData[key]
      }
    })

    const response = await api.post('/movies', backendData)
    return response.data
  },

  // Update movie
  async updateMovie(id, movieData) {
    const backendData = {
      title: movieData.title?.trim(),
      description: movieData.description,
      genres: movieData.genres,
      languages: movieData.languages,
      duration_minutes: movieData.duration_minutes,
      release_date: movieData.release_date,
      end_date: movieData.end_date,
      rating: movieData.rating,
      poster_url: movieData.poster_url,
      trailer_url: movieData.trailer_url,
      cast: movieData.cast,
      director: movieData.director,
      producers: movieData.producers,
      status: movieData.status,
      notes: movieData.notes
    }

    // Remove undefined values
    Object.keys(backendData).forEach(key => {
      if (backendData[key] === undefined) {
        delete backendData[key]
      }
    })

    const response = await api.put(`/movies/${id}`, backendData)
    return response.data
  },

  // Update movie status
  async updateStatus(id, status) {
    const response = await api.put(`/movies/${id}/status`, { status })
    return response.data
  },

  // Delete movie (soft delete)
  // async deleteMovie(id) {
  //   const response = await api.delete(`/movies/${id}`)
  //   return response.data
  // },
  //delete movie (force delete)
  async deleteMovie(id) {
    const response = await api.delete(`/movies/${id}/force-delete`)
    return response.data
  },

  // Restore deleted movie
  async restoreMovie(id) {
    const response = await api.put(`/movies/${id}/restore`)
    return response.data
  },

  // Force delete movie (permanent)
  async forceDeleteMovie(id) {
    const response = await api.delete(`/movies/${id}/force-delete`)
    return response.data
  },

  // Get deleted movies
  async getDeletedMovies(params = {}) {
    const backendParams = {
      page: params.page || 1,
      limit: params.per_page || 10,
      sortBy: params.sort_by || 'deletedAt',
      sortOrder: params.sort_order || 'desc'
    }

    const response = await api.get('/movies/deleted', { params: backendParams })

    if (response.data?.success && response.data?.data) {
      const { movies, pagination } = response.data.data
      return {
        data: movies.map(movie => this.transformMovie(movie)),
        ...pagination
      }
    }

    return response.data
  },

  // Helper: Transform movie object
  transformMovie(movie) {
    return {
      id: movie._id,
      title: movie.title,
      description: movie.description || '',
      genres: movie.genres || [],
      languages: movie.languages || [],
      duration_minutes: movie.duration_minutes,
      duration_display: movie.duration_display || this.formatDuration(movie.duration_minutes),
      release_date: movie.release_date,
      release_date_formatted: movie.release_date_formatted || (movie.release_date ? new Date(movie.release_date).toLocaleDateString() : ''),
      end_date: movie.end_date,
      rating: movie.rating || 0,
      poster_url: movie.poster_url,
      trailer_url: movie.trailer_url,
      cast: movie.cast || [],
      director: movie.director || '',
      producers: movie.producers || [],
      status: movie.status,
      status_display: this.getStatusLabel(movie.status),
      notes: movie.notes || '',
      created_at: movie.createdAt,
      updated_at: movie.updatedAt,
      deleted_at: movie.deletedAt,
      is_deleted: !!movie.deletedAt
    }
  },

  // Helper: Format duration
  formatDuration(minutes) {
    if (!minutes) return '-'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  },

  // Helper: Get status label
  getStatusLabel(status) {
    const statusObj = this.MOVIE_STATUSES.find(s => s.value === status)
    return statusObj ? statusObj.label : status
  },

  // Helper: Get genre label
  getGenreLabel(genre) {
    const genreObj = this.MOVIE_GENRES.find(g => g.value === genre)
    return genreObj ? genreObj.label : genre
  }
}
