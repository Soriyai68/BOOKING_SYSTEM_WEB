<template>
  <div class="create-screen">
    <div class="page-header">
      <h2>{{ $t("screens.createScreen") }}</h2>
      <el-button @click="$router.back()"
        ><el-icon><ArrowLeft /></el-icon>{{ $t("actions.back") }}</el-button
      >
    </div>

    <el-card>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="140px">
        <el-form-item :label="$t('screens.name')" prop="screen_name">
          <el-input
            v-model="form.screen_name"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item :label="$t('screens.theater')" prop="theater_id">
          <el-select
            v-model="form.theater_id"
            style="width: 100%"
            :loading="theatersLoading"
            filterable
          >
            <el-option
              v-for="opt in theaters"
              :key="opt.id"
              :label="opt.display_name || opt.name"
              :value="opt.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('screens.type')" prop="screen_type">
          <el-select v-model="form.screen_type" style="width: 100%">
            <el-option
              v-for="opt in screenService.SCREEN_TYPES"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>

        <!-- <el-form-item :label="$t('screens.totalSeats')" prop="total_seats">
          <el-input-number v-model="form.total_seats" :min="1" :max="1000" />
        </el-form-item> -->

        <el-form-item :label="$t('screens.status')" prop="status">
          <el-select v-model="form.status" style="width: 100%">
            <el-option
              v-for="opt in screenService.SCREEN_STATUSES"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('screens.notes')" prop="notes">
          <el-input
            v-model="form.notes"
            type="textarea"
            :rows="3"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSubmit">{{
            $t("actions.submit")
          }}</el-button>
          <el-button @click="resetForm">{{ $t("actions.reset") }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAppStore } from "@/stores/app";
import { useI18n } from "vue-i18n";
import { screenService } from "@/services/screenService";
import { theaterService } from "@/services/theaterService";
import { ElMessage } from "element-plus";
import { ArrowLeft } from "@element-plus/icons-vue";

const router = useRouter();
const route = useRoute();
const appStore = useAppStore();
const { t } = useI18n();

const formRef = ref();
const loading = ref(false);
const theaters = ref([]);
const theatersLoading = ref(false);

const form = reactive({
  screen_name: "",
  theater_id: route.query.theater_id || "",
  screen_type: "standard",
  // total_seats: 0,
  status: "active",
  notes: "",
});

const rules = {
  screen_name: [
    { required: true, message: t("validation.required"), trigger: "blur" },
  ],
  theater_id: [
    { required: true, message: t("validation.required"), trigger: "change" },
  ],
  // total_seats: [{ required: true, message: t('validation.required'), trigger: 'change' }]
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    loading.value = true;
    await screenService.createScreen(form);
    ElMessage.success(t("screens.createSuccess"));
    router.push("/admin/screens");
  } catch (e) {
    console.error(e);
    if (e?.response?.data?.message) {
      ElMessage.error(e.response.data.message);
    } else {
      ElMessage.error("Failed to create screen");
    }
  } finally {
    loading.value = false;
  }
};

const loadTheaters = async () => {
  theatersLoading.value = true;
  try {
    const res = await theaterService.getTheaters({
      status: "active",
      per_page: 100,
    });
    theaters.value = res.data || [];
  } catch (e) {
    console.error(e);
    ElMessage.error("Failed to load theaters");
  } finally {
    theatersLoading.value = false;
  }
};

const resetForm = () => {
  if (formRef.value) formRef.value.resetFields();
  Object.assign(form, {
    screen_name: "",
    theater_id: route.query.theater_id || "",
    screen_type: "standard",
    // total_seats: 0,
    status: "active",
    notes: "",
  });
};

onMounted(async () => {
  await loadTheaters();
  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("screens.title"), path: "/admin/screens" },
    { title: t("screens.createScreen"), path: "/admin/screens/create" },
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
  max-width: 640px;
}
</style>