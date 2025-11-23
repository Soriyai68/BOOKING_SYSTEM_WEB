<template>
  <div class="edit-promotion">
    <div class="page-header">
      <h2>Edit Promotion</h2>
      <el-button @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        Back
      </el-button>
    </div>

    <el-card v-loading="pageLoading">
      <div v-if="loadError" class="error-state">
        <el-result
          icon="error"
          title="Error"
          :sub-title="loadError"
        >
          <template #extra>
            <el-button type="primary" @click="load">
              Refresh
            </el-button>
            <el-button @click="$router.back()">
              Back
            </el-button>
          </template>
        </el-result>
      </div>

      <el-form
        v-else
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="160px"
      >
        <!-- Promotion Code -->
        <el-form-item label="Promotion Code" prop="code">
          <el-input v-model="form.code" maxlength="50" show-word-limit />
        </el-form-item>

        <!-- Title -->
        <el-form-item label="Title" prop="title">
          <el-input v-model="form.title" maxlength="200" show-word-limit />
        </el-form-item>

        <!-- Start Date -->
        <el-form-item label="Start Date" prop="start_date">
          <el-date-picker
            v-model="form.start_date"
            type="date"
            style="width: 100%"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <!-- End Date -->
        <el-form-item label="End Date" prop="end_date">
          <el-date-picker
            v-model="form.end_date"
            type="date"
            style="width: 100%"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <!-- Status -->
        <el-form-item label="Status" prop="status">
          <el-select v-model="form.status" style="width: 100%">
            <el-option
              v-for="opt in promotionService.STATUS_OPTIONS"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>

        <!-- Image Upload/URL -->
        <el-form-item label="Promotion Image">
          <ImageUpload v-model="form.image_url" />
        </el-form-item>

        <!-- Actions -->
        <el-form-item>
          <el-button
            v-permission="'promotions.edit'"
            type="primary"
            :loading="loading"
            @click="handleSubmit"
          >
            Update
          </el-button>
          <el-button @click="resetForm">
            Reset
          </el-button>
          <el-button @click="$router.back()">
            Cancel
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAppStore } from "@/stores/app";
import { promotionService } from "@/services/promotionService";
import { ElMessage } from "element-plus";
import { ArrowLeft } from "@element-plus/icons-vue";
import ImageUpload from "@/components/common/ImageUpload.vue";

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();

const formRef = ref();
const loading = ref(false);
const pageLoading = ref(false);
const loadError = ref("");
const original = ref(null);

const form = reactive({
  code: "",
  title: "",
  start_date: "",
  end_date: "",
  status: "Inactive",
  image_url: "",
});

const rules = {
  code: [
    { required: true, message: "Promotion code is required", trigger: "blur" },
  ],
  title: [
    { required: true, message: "Title is required", trigger: "blur" },
  ],
  start_date: [
    { required: true, message: "Start date is required", trigger: "change" },
  ],
  end_date: [
    { required: true, message: "End date is required", trigger: "change" },
  ],
  status: [
    { required: true, message: "Status is required", trigger: "change" },
  ],
};

const load = async () => {
  pageLoading.value = true;
  loadError.value = "";
  try {
    const data = await promotionService.getPromotion(route.params.id);
    original.value = data;
    Object.assign(form, {
      code: data.code,
      title: data.title,
      start_date: data.start_date,
      end_date: data.end_date,
      status: data.status,
      image_url: data.image_url || "",
    });
  } catch (e) {
    console.error(e);
    loadError.value = e?.response?.data?.message || "Failed to load promotion";
  } finally {
    pageLoading.value = false;
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    loading.value = true;
    await promotionService.updatePromotion(route.params.id, form);
    ElMessage.success("Promotion updated successfully");
    router.push("/admin/promotions");
  } catch (e) {
    console.error(e);
    if (e?.response?.data?.message) {
      ElMessage.error(e.response.data.message);
    } else {
      ElMessage.error("Failed to update promotion");
    }
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  if (!original.value) return;
  Object.assign(form, {
    code: original.value.code,
    title: original.value.title,
    start_date: original.value.start_date,
    end_date: original.value.end_date,
    status: original.value.status,
    image_url: original.value.image_url || "",
  });
  if (formRef.value) formRef.value.clearValidate();
};

onMounted(async () => {
  await load();
  appStore.setBreadcrumbs([
    { title: "Dashboard", path: "/admin/dashboard" },
    { title: "Promotions", path: "/admin/promotions" },
    { title: "Edit Promotion", path: "#" },
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

.el-form {
  max-width: 800px;
}

.error-state {
  padding: 40px 0;
}
</style>
