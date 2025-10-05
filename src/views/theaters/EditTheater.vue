<template>
  <div class="edit-theater">
    <div class="page-header">
      <h2>{{ $t("theaters.editTheater") }}</h2>
      <el-button @click="$router.back()">{{ $t("actions.back") }}</el-button>
    </div>

    <el-card v-loading="pageLoading">
      <div v-if="loadError" class="error-state">
        <el-result
          icon="error"
          :title="$t('messages.error')"
          :sub-title="loadError"
        >
        <el-result
          icon="error"
          :title="$t('messages.error')"
          :sub-title="loadError"
        >
          <template #extra>
            <el-button type="primary" @click="load">{{
              $t("actions.refresh")
            }}</el-button>
            <el-button @click="$router.back()">{{
              $t("actions.back")
            }}</el-button>
            <el-button type="primary" @click="load">{{
              $t("actions.refresh")
            }}</el-button>
            <el-button @click="$router.back()">{{
              $t("actions.back")
            }}</el-button>
          </template>
        </el-result>
      </div>

      <el-form
        v-else
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="140px"
      >
      <el-form
        v-else
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="140px"
      >
        <el-form-item :label="$t('theaters.name')" prop="name">
          <el-input v-model="form.name" maxlength="100" show-word-limit />
        </el-form-item>

        <el-form-item :label="$t('theaters.address')" prop="address">
          <el-input v-model="form.address" maxlength="500" show-word-limit />
        </el-form-item>

        <el-form-item :label="$t('theaters.city')" prop="city">
          <el-input v-model="form.city" maxlength="100" />
        </el-form-item>

        <el-form-item :label="$t('theaters.province')" prop="province">
          <el-input v-model="form.province" maxlength="100" />
        </el-form-item>

        <el-form-item :label="$t('theaters.status')" prop="status">
          <el-select v-model="form.status" style="width: 100%">
            <el-option
              v-for="opt in theaterService.STATUS_OPTIONS"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          <el-select v-model="form.status" style="width: 100%">
            <el-option
              v-for="opt in theaterService.STATUS_OPTIONS"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          :label="$t('theaters.totalCapacity')"
          prop="total_capacity"
        >
        <el-form-item
          :label="$t('theaters.totalCapacity')"
          prop="total_capacity"
        >
          <el-input-number v-model="form.total_capacity" :min="0" />
        </el-form-item>

        <el-form-item :label="$t('theaters.features')">
          <el-select
            v-model="form.features"
            multiple
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="f in featureOptions"
              :key="f"
              :label="f"
              :value="f"
            />
          <el-select
            v-model="form.features"
            multiple
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="f in featureOptions"
              :key="f"
              :label="f"
              :value="f"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('theaters.notes')">
          <el-input
            v-model="form.notes"
            type="textarea"
            :rows="3"
            maxlength="1000"
            show-word-limit
          />
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
            $t("theaters.updateTheater")
          }}</el-button>
          <el-button @click="resetForm">{{ $t("actions.reset") }}</el-button>
          <el-button type="primary" :loading="loading" @click="handleSubmit">{{
            $t("theaters.updateTheater")
          }}</el-button>
          <el-button @click="resetForm">{{ $t("actions.reset") }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAppStore } from "@/stores/app";
import { theaterService } from "@/services/theaterService";
import { ElMessage } from "element-plus";
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAppStore } from "@/stores/app";
import { theaterService } from "@/services/theaterService";
import { ElMessage } from "element-plus";

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const { t } = useI18n();

const formRef = ref();
const loading = ref(false);
const pageLoading = ref(false);
const loadError = ref("");
const featureOptions = [
  "parking",
  "food_court",
  "disabled_access",
  "air_conditioning",
  "wifi",
  "3d_capable",
  "imax",
  "vip_lounge",
  "arcade",
];
const formRef = ref();
const loading = ref(false);
const pageLoading = ref(false);
const loadError = ref("");
const featureOptions = [
  "parking",
  "food_court",
  "disabled_access",
  "air_conditioning",
  "wifi",
  "3d_capable",
  "imax",
  "vip_lounge",
  "arcade",
];

const original = ref(null);
const original = ref(null);

const form = reactive({
  name: "",
  address: "",
  city: "",
  province: "",
  status: "active",
  total_capacity: 0,
  features: [],
  notes: "",
});
  name: "",
  address: "",
  city: "",
  province: "",
  status: "active",
  total_capacity: 0,
  features: [],
  notes: "",
});

const rules = {
  name: [
    { required: true, message: t("validation.required"), trigger: "blur" },
  ],
  address: [
    { required: true, message: t("validation.required"), trigger: "blur" },
  ],
  city: [
    { required: true, message: t("validation.required"), trigger: "blur" },
  ],
  province: [
    { required: true, message: t("validation.required"), trigger: "blur" },
  ],
};
  name: [
    { required: true, message: t("validation.required"), trigger: "blur" },
  ],
  address: [
    { required: true, message: t("validation.required"), trigger: "blur" },
  ],
  city: [
    { required: true, message: t("validation.required"), trigger: "blur" },
  ],
  province: [
    { required: true, message: t("validation.required"), trigger: "blur" },
  ],
};

const load = async () => {
  pageLoading.value = true;
  loadError.value = "";
  pageLoading.value = true;
  loadError.value = "";
  try {
    const data = await theaterService.getTheater(route.params.id);
    original.value = data;
    Object.assign(form, data);
    const data = await theaterService.getTheater(route.params.id);
    original.value = data;
    Object.assign(form, data);
  } catch (e) {
    console.error(e);
    loadError.value = e?.response?.data?.message || "Failed to load theater";
    console.error(e);
    loadError.value = e?.response?.data?.message || "Failed to load theater";
  } finally {
    pageLoading.value = false;
    pageLoading.value = false;
  }
};
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    loading.value = true;
    await theaterService.updateTheater(route.params.id, form);
    ElMessage.success(t("theaters.updateSuccess"));
    router.push("/admin/theaters");
    await formRef.value.validate();
    loading.value = true;
    await theaterService.updateTheater(route.params.id, form);
    ElMessage.success(t("theaters.updateSuccess"));
    router.push("/admin/theaters");
  } catch (e) {
    console.error(e);
    ElMessage.error(e?.response?.data?.message || "Failed to update theater");
    console.error(e);
    ElMessage.error(e?.response?.data?.message || "Failed to update theater");
  } finally {
    loading.value = false;
    loading.value = false;
  }
};
};

const resetForm = () => {
  if (!original.value) return;
  Object.assign(form, original.value);
  if (formRef.value) formRef.value.clearValidate();
};
  if (!original.value) return;
  Object.assign(form, original.value);
  if (formRef.value) formRef.value.clearValidate();
};

onMounted(async () => {
  await load();
  await load();
  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("theaters.title"), path: "/admin/theaters" },
    { title: t("theaters.editTheater"), path: "#" },
  ]);
});
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("theaters.title"), path: "/admin/theaters" },
    { title: t("theaters.editTheater"), path: "#" },
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
.error-state {
  text-align: center;
  padding: 40px 20px;
}
.el-form {
  max-width: 640px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.error-state {
  text-align: center;
  padding: 40px 20px;
}
.el-form {
  max-width: 640px;
}
</style>
