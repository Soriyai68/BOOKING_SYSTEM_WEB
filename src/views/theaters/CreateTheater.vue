<template>
  <el-dialog
    v-model="visible"
    :title="$t('theaters.createTheater')"
    width="640px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="140px">
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
        v-permission="'theaters.create'"
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
import { ref, reactive, watch } from "vue";
import { useI18n } from "vue-i18n";
import { theaterService } from "@/services/theaterService";
import { ElMessage } from "element-plus";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "success"]);

const { t } = useI18n();
const formRef = ref();
const loading = ref(false);

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
  (val) => {
    visible.value = val;
  }
);

watch(visible, (val) => {
  emit("update:modelValue", val);
});

const handleSubmit = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    loading.value = true;
    await theaterService.createTheater(form);
    ElMessage.success(t("theaters.createSuccess"));
    visible.value = false;
    emit("success");
  } catch (e) {
    console.error(e);
    ElMessage.error(e?.response?.data?.message || "Failed to create theater");
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  if (formRef.value) formRef.value.resetFields();
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
