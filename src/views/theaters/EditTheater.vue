<template>
  <el-dialog
    v-model="visible"
    :title="$t('theaters.editTheater')"
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
        </el-select>
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
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">{{ $t("actions.cancel") }}</el-button>
      <el-button @click="resetForm">{{ $t("actions.reset") }}</el-button>
      <el-button
        v-permission="'theaters.edit'"
        type="primary"
        :loading="loading"
        @click="handleSubmit"
      >
        {{ $t("theaters.updateTheater") }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, nextTick } from "vue";
import { useI18n } from "vue-i18n";
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
const pageLoading = ref(false);

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

const visible = ref(props.modelValue);

watch(
  () => props.modelValue,
  async (val) => {
    visible.value = val;
    if (val && props.theaterId) {
      await nextTick();
      await loadTheater();
    }
  }
);

watch(visible, (val) => {
  emit("update:modelValue", val);
});

const loadTheater = async () => {
  pageLoading.value = true;
  try {
    const data = await theaterService.getTheater(props.theaterId);
    original.value = data;
    Object.assign(form, data);
  } catch (e) {
    console.error(e);
    ElMessage.error(e?.response?.data?.message || "Failed to load theater");
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
    await theaterService.updateTheater(props.theaterId, form);
    ElMessage.success(t("theaters.updateSuccess"));
    visible.value = false;
    emit("success");
  } catch (e) {
    console.error(e);
    ElMessage.error(e?.response?.data?.message || "Failed to update theater");
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  if (!original.value) return;
  Object.assign(form, original.value);
  if (formRef.value) formRef.value.clearValidate();
};

const handleClosed = () => {
  Object.assign(form, {
    name: "",
    address: "",
    city: "",
    province: "",
    status: "active",
    total_capacity: 0,
    features: [],
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
