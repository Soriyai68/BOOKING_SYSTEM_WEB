<template>
  <el-dialog
    v-model="visible"
    :title="$t('halls.createHall')"
    width="640px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="140px">
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

      <el-form-item :label="$t('halls.screenType')" prop="screen_type">
        <el-select v-model="form.screen_type" style="width: 100%">
          <el-option
            v-for="opt in hallService.SCREEN_TYPES"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
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
        v-permission="'halls.create'"
        type="primary"
        :loading="loading"
        @click="handleSubmit"
      >
        {{ $t("actions.submit") }}
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
  theaterId: {
    type: [String, Number],
    default: null,
  },
});

const emit = defineEmits(["update:modelValue", "success"]);

const { t } = useI18n();
const formRef = ref();
const loading = ref(false);
const theaters = ref([]);
const theatersLoading = ref(false);

const form = reactive({
  hall_name: "",
  theater_id: "",
  screen_type: "2d",
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
};

const visible = ref(props.modelValue);

watch(
  () => props.modelValue,
  async (val) => {
    visible.value = val;
    if (val) {
      await nextTick();
      await loadTheaters();
      if (props.theaterId) {
        form.theater_id = props.theaterId;
      }
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

const handleSubmit = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    loading.value = true;
    await hallService.createHall(form);
    ElMessage.success(t("halls.createSuccess"));
    visible.value = false;
    emit("success");
  } catch (e) {
    console.error(e);
    if (e?.response?.data?.message) {
      ElMessage.error(e.response.data.message);
    } else {
      ElMessage.error("Failed to create hall");
    }
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  if (formRef.value) formRef.value.resetFields();
  Object.assign(form, {
    hall_name: "",
    theater_id: props.theaterId || "",
    screen_type: "2d",
    status: "active",
    notes: "",
  });
};

const handleClosed = () => {
  resetForm();
};
</script>

<style scoped>
.el-form {
  max-width: 100%;
}
</style>
