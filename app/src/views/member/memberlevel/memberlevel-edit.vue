<template>
  <AdminAnimalModal
    :visible="visible"
    :title="title"
    width="520px"
    @update:visible="handleVisibleChange"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="82px"
      class="develop-dialog-form"
    >
      <div class="field-desc">设置会员成长体系，定义不同等级及其排序。</div>
      <el-form-item label="等级名称" prop="name">
        <Input v-model="formData.name" placeholder="请输入等级名称" :maxlength="30" allow-clear />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <Input v-model="sortModel" type="number" placeholder="请输入排序号" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="develop-dialog-footer">
        <Button type="default" @click="closeDialog">取消</Button>
        <Button type="primary" :loading="loading" @click="handleSubmit">保存</Button>
      </div>
    </template>
  </AdminAnimalModal>
</template>

<script setup lang="ts">
import { message } from "@/utils/feedback";
import { computed, nextTick, reactive, ref, watch } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { type FormInstance, type FormRules } from "element-plus";
import AdminAnimalModal from "@/components/AdminPage/AdminAnimalModal.vue";
import { Button, Input } from "animal-island-vue";
import MemberLevelAPI from "@/api/member/member-level";
import type { MemberLevelForm, MemberLevelItem } from "@/types/api";

const props = defineProps<{
  visible: boolean;
  data?: MemberLevelItem | null;
}>();

const emit = defineEmits<{
  "update:visible": [value: boolean];
  done: [];
}>();

const formRef = ref<FormInstance>();
const loading = ref(false);

const initialFormData: MemberLevelForm = {
  name: "",
  sort: 0,
};

const formData = reactive<MemberLevelForm>({ ...initialFormData });

const title = computed(() => (props.data ? "编辑会员等级" : "新增会员等级"));

const sortModel = computed<string>({
  get: () => (formData.sort == null ? "" : String(formData.sort)),
  set: (value) => {
    formData.sort = value === "" ? 0 : Number(value);
  },
});

const rules: FormRules = {
  name: [{ required: true, message: "请输入等级名称", trigger: "blur" }],
};

function resetForm(): void {
  Object.assign(formData, { ...initialFormData, id: undefined });
  formRef.value?.resetFields();
  formRef.value?.clearValidate();
}

async function openDialog(): Promise<void> {
  resetForm();
  if (props.data) {
    Object.assign(formData, {
      id: props.data.id,
      name: props.data.name,
      sort: props.data.sort,
    });
  }
  await nextTick();
  formRef.value?.clearValidate();
}

function closeDialog(): void {
  emit("update:visible", false);
  resetForm();
}

function handleVisibleChange(value: boolean): void {
  if (!value) closeDialog();
}

const handleSubmit = useDebounceFn(async () => {
  const valid = await formRef.value?.validate().then(
    () => true,
    () => false
  );
  if (!valid) return;

  loading.value = true;
  try {
    if (formData.id) {
      await MemberLevelAPI.update(formData.id, formData);
      message.success("修改成功");
    } else {
      await MemberLevelAPI.create(formData);
      message.success("新增成功");
    }
    emit("done");
    closeDialog();
  } finally {
    loading.value = false;
  }
}, 300);

watch(
  () => props.visible,
  (visible) => {
    if (visible) openDialog();
  }
);
</script>
