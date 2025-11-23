<template>
  <div class="promotion-detail">
    <div class="page-header">
      <h2>Promotion Details</h2>
      <div>
        <el-button @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          Back
        </el-button>
        <el-button
          v-permission="'promotions.edit'"
          type="primary"
          @click="goEdit"
        >
          Edit
        </el-button>
      </div>
    </div>

    <el-card v-loading="loading">
      <div v-if="promotion" class="promotion-content">
        <!-- Image Section -->
        <div v-if="promotion.image_url" class="image-section">
          <el-image
            :src="promotion.image_url"
            :alt="promotion.title"
            class="promotion-image"
          />
        </div>

        <!-- Promotion Information -->
        <el-descriptions :title="promotion.title" :column="2" border>
          <el-descriptions-item label="Promotion Code">
            {{ promotion.code || "-" }}
          </el-descriptions-item>

          <el-descriptions-item label="Status">
            <el-tag :type="statusTagType(promotion.status)">
              {{ promotion.status }}
            </el-tag>
          </el-descriptions-item>

          <el-descriptions-item label="Start Date">
            {{ formatDate(promotion.start_date) }}
          </el-descriptions-item>

          <el-descriptions-item label="End Date">
            {{ formatDate(promotion.end_date) }}
          </el-descriptions-item>

          <el-descriptions-item label="Title" :span="2">
            {{ promotion.title || "-" }}
          </el-descriptions-item>

          <el-descriptions-item label="Created At">
            {{ formatDateTime(promotion.created_at) }}
          </el-descriptions-item>

          <el-descriptions-item label="Updated At">
            {{ formatDateTime(promotion.updated_at) }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- Actions -->
        <div class="actions-section">
          <el-button
            v-permission="'promotions.edit'"
            type="primary"
            @click="goEdit"
          >
            Edit
          </el-button>
          <el-button
            v-permission="'promotions.delete'"
            type="danger"
            @click="handleDelete"
          >
            Delete
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAppStore } from "@/stores/app";
import { promotionService } from "@/services/promotionService";
import { ElMessage, ElMessageBox } from "element-plus";
import { ArrowLeft } from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();

const loading = ref(false);
const promotion = ref(null);

const load = async () => {
  loading.value = true;
  try {
    const data = await promotionService.getPromotion(route.params.id);
    promotion.value = data;
  } catch (e) {
    console.error(e);
    ElMessage.error("Failed to load promotion");
  } finally {
    loading.value = false;
  }
};

const goEdit = () => router.push(`/admin/promotions/${route.params.id}/edit`);

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      "Are you sure you want to delete this promotion?",
      "Delete Promotion",
      {
        type: "warning",
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
      }
    );
    await promotionService.deletePromotion(route.params.id);
    ElMessage.success("Promotion deleted successfully");
    router.push("/admin/promotions");
  } catch (err) {
    if (err !== "cancel") {
      console.error(err);
      ElMessage.error("Failed to delete promotion");
    }
  }
};

const statusTagType = (status) => {
  switch (status) {
    case "Active":
      return "success";
    case "Inactive":
      return "info";
    case "Expired":
      return "danger";
    default:
      return "";
  }
};

const formatDate = (str) => (str ? new Date(str).toLocaleDateString() : "-");
const formatDateTime = (str) => (str ? new Date(str).toLocaleString() : "-");

onMounted(async () => {
  await load();
  appStore.setBreadcrumbs([
    { title: "Dashboard", path: "/admin/dashboard" },
    { title: "Promotions", path: "/admin/promotions" },
    { title: "Promotion Details", path: "#" },
  ]);
});
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.promotion-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.image-section {
  text-align: left;
  margin-bottom: 20px;
}

.promotion-image {
  max-width: 600px;
  max-height: 400px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.actions-section {
  margin-top: 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-start;
}
</style>
