<template>
  <div class="data-table-wrapper">
    <!-- Toolbar Section -->
    <div v-if="showToolbar" class="toolbar">
      <el-input
        v-if="searchable"
        v-model="searchText"
        :placeholder="searchPlaceholder"
        class="search-input"
        :prefix-icon="Search"
        clearable
        @input="handleSearch"
      />
      
      <slot name="filters"></slot>
      
      <el-select 
        v-if="sortable" 
        v-model="currentSort" 
        :placeholder="$t('table.sortBy')"
        @change="handleSort"
      >
        <el-option
          v-for="option in sortOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
      
      <el-select 
        v-if="sortable" 
        v-model="currentSortOrder" 
        :placeholder="$t('table.sortOrder')"
        @change="handleSort"
      >
        <el-option label="ASC" value="asc" />
        <el-option label="DESC" value="desc" />
      </el-select>

      <slot name="actions"></slot>
    </div>

    <!-- Table Section -->
    <el-table 
      :data="data" 
      v-loading="loading" 
      :style="{ width: '100%' }"
      :stripe="stripe"
      :border="border"
      :highlight-current-row="highlightCurrentRow"
      @selection-change="handleSelectionChange"
      @sort-change="handleTableSort"
    >
      <el-table-column
        v-if="selectable"
        type="selection"
        width="55"
      />
      
      <slot></slot>
    </el-table>

    <!-- Pagination Section -->
    <div v-if="paginated" class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="currentPageSize"
        :page-sizes="pageSizes"
        :total="total"
        :layout="paginationLayout"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { debounce } from 'lodash-es';

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  total: {
    type: Number,
    default: 0
  },
  currentPage: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 10
  },
  pageSizes: {
    type: Array,
    default: () => [10, 20, 50, 100]
  },
  paginated: {
    type: Boolean,
    default: true
  },
  paginationLayout: {
    type: String,
    default: 'total, sizes, prev, pager, next, jumper'
  },
  searchable: {
    type: Boolean,
    default: true
  },
  searchPlaceholder: {
    type: String,
    default: 'Search...'
  },
  sortable: {
    type: Boolean,
    default: true
  },
  sortOptions: {
    type: Array,
    default: () => []
  },
  defaultSort: {
    type: String,
    default: ''
  },
  defaultSortOrder: {
    type: String,
    default: 'asc'
  },
  showToolbar: {
    type: Boolean,
    default: true
  },
  selectable: {
    type: Boolean,
    default: false
  },
  stripe: {
    type: Boolean,
    default: false
  },
  border: {
    type: Boolean,
    default: false
  },
  highlightCurrentRow: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  'search',
  'sort',
  'page-change',
  'size-change',
  'selection-change',
  'update:currentPage',
  'update:pageSize'
]);

const searchText = ref('');
const currentSort = ref(props.defaultSort);
const currentSortOrder = ref(props.defaultSortOrder);
const currentPage = computed({
  get: () => props.currentPage,
  set: (value) => emit('update:currentPage', value)
});
const currentPageSize = computed({
  get: () => props.pageSize,
  set: (value) => emit('update:pageSize', value)
});

// Debounced search
const debouncedSearch = debounce(() => {
  emit('search', searchText.value);
}, 500);

const handleSearch = () => {
  debouncedSearch();
};

const handleSort = () => {
  emit('sort', {
    sortBy: currentSort.value,
    sortOrder: currentSortOrder.value
  });
};

const handleTableSort = ({ column, prop, order }) => {
  const sortOrder = order === 'ascending' ? 'asc' : 'desc';
  emit('sort', {
    sortBy: prop,
    sortOrder: sortOrder
  });
};

const handleSizeChange = (size) => {
  emit('size-change', size);
};

const handleCurrentChange = (page) => {
  emit('page-change', page);
};

const handleSelectionChange = (selection) => {
  emit('selection-change', selection);
};

// Watch for external changes
watch(() => props.currentPage, (newVal) => {
  if (newVal !== currentPage.value) {
    currentPage.value = newVal;
  }
});

watch(() => props.pageSize, (newVal) => {
  if (newVal !== currentPageSize.value) {
    currentPageSize.value = newVal;
  }
});
</script>

<style scoped>
.data-table-wrapper {
  background: white;
  border-radius: 8px;
}

.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  align-items: center;
}

.search-input {
  width: 300px;
  min-width: 200px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    width: 100%;
  }
  
  .pagination {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .toolbar {
    gap: 8px;
  }
}
</style>