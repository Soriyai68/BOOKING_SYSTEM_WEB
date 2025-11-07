<template>
  <el-dialog
    v-model="visible"
    :title="$t('halls.editHall')"
    width="640px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="140px"
      v-loading="pageLoading"
    >
      <el-form-item :label="$t('halls.name')" prop="hall_name">
        <el-input v-model="form.hall_name" maxlength="100" show-word-limit />
      </el-form-item>

      <el-form-item :label="$t('halls.theater')" prop="theater_id">
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

      <el-form-item :label="$t('halls.type')" prop="screen_type">
        <el-select v-model="form.screen_type" style="width: 100%">
          <el-option
            v-for="opt in hallService.SCREEN_TYPES"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="$t('halls.totalSeats')" prop="total_seats">
        <el-input-number v-model="form.total_seats" :min="1" :max="1000" readonly />
      </el-form-item>

      <el-form-item :label="$t('halls.status')" prop="status">
        <el-select v-model="form.status" style="width: 100%">
          <el-option
            v-for="opt in hallService.HALL_STATUSES"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="$t('halls.notes')" prop="notes">
        <el-input
          v-model="form.notes"
          type="textarea"
          :rows="3"
          maxlength="1000"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">{{ $t("actions.cancel") }}</el-button>
      <el-button @click="resetForm">{{ $t("actions.reset") }}</el-button>
      <el-button
        v-permission="'halls.edit'"
        type="primary"
        :loading="loading"
        @click="handleSubmit"
      >
        {{ $t("halls.updateHall") }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { hallService } from "@/services/hallService";
import { theaterService } from "@/services/theaterService";
import { ElMessage } from "element-plus";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  hallId: {
    type: [String, Number],
    default: null,
  },
});

const emit = defineEmits(["update:modelValue", "success"]);

const { t } = useI18n();
const formRef = ref();
const loading = ref(false);
const pageLoading = ref(false);

const original = ref(null);
const theaters = ref([]);
const theatersLoading = ref(false);

const form = reactive({
  hall_name: "",
  theater_id: "",
  screen_type: "standard",
  total_seats: 1,
  status: "active",
  notes: "",
});

const rules = {
  hall_name: [
    { required: true, message: t("validation.required"), trigger: "blur" },
  ],
  theater_id: [
    { required: true, message: t("validation.required"), trigger: "change" },
  ],
  total_seats: [
    { required: true, message: t("validation.required"), trigger: "change" },
  ],
};

const visible = ref(props.modelValue);

watch(
  () => props.modelValue,
  async (val) => {
    visible.value = val;
    if (val && props.hallId) {
      await nextTick();
      await Promise.all([loadHall(), loadTheaters()]);
    }
  }
);

watch(visible, (val) => {
  emit("update:modelValue", val);
});

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

const loadHall = async () => {
  pageLoading.value = true;
  try {
    const data = await hallService.getHall(props.hallId);
    original.value = data;
    Object.assign(form, {
      hall_name: data.hall_name,
      theater_id: data.theater_id || "",
      screen_type: data.screen_type || "standard",
      total_seats: data.total_seats || 1,
      status: data.status || "active",
      notes: data.notes || "",
    });
  } catch (e) {
    console.error(e);
    ElMessage.error(e?.response?.data?.message || "Failed to load hall");
    visible.value = false;
  } finally {
    pageLoading.value = false;
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    loading.value = true;
    await hallService.updateHall(props.hallId, form);
    ElMessage.success(t("halls.updateSuccess"));
    visible.value = false;
    emit("success");
  } catch (e) {
    console.error(e);
    if (e?.response?.data?.message) ElMessage.error(e.response.data.message);
    else ElMessage.error("Failed to update hall");
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  if (!original.value) return;
  Object.assign(form, {
    hall_name: original.value.hall_name,
    theater_id: original.value.theater_id || "",
    screen_type: original.value.screen_type || "standard",
    total_seats: original.value.total_seats || 1,
    status: original.value.status || "active",
    notes: original.value.notes || "",
  });
  if (formRef.value) formRef.value.clearValidate();
};

const handleClosed = () => {
  Object.assign(form, {
    hall_name: "",
    theater_id: "",
    screen_type: "standard",
    total_seats: 1,
    status: "active",
    notes: "",
  });
  original.value = null;
  if (formRef.value) {
    formRef.value.clearValidate();
  }
};
</script>

<style scoped>
.el-form {
  max-width: 100%;
}
</style>
