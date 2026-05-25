<template>
  <AdminAnimalModal
    :visible="visible"
    :title="title"
    width="600px"
    @update:visible="handleVisibleChange"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      class="develop-dialog-form"
    >
      <div class="field-desc">维护角色名称、权限编码与启用状态，决定后台权限范围。</div>
      <el-form-item label="角色名称" prop="name">
        <Input v-model="formData.name" placeholder="请输入角色名称" allow-clear />
      </el-form-item>
      <el-form-item label="角色编码" prop="code">
        <Input v-model="formData.code" placeholder="请输入角色编码" allow-clear />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <Switch v-model="statusOn">
          <template #checked>正常</template>
          <template #unchecked>停用</template>
        </Switch>
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <Input v-model="sortModel" type="number" placeholder="请输入排序" />
      </el-form-item>
      <el-form-item label="备注" prop="note">
        <AnimalTextarea
          v-model="formData.note"
          :rows="3"
          :maxlength="200"
          placeholder="请输入备注"
        />
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
import { type FormInstance, type FormRules } from "element-plus";
import AdminAnimalModal from "@/components/AdminPage/AdminAnimalModal.vue";
import { Button, Input, Switch } from "animal-island-vue";
import AnimalTextarea from "@/components/AnimalTextarea/index.vue";
import RoleAPI from "@/api/system/role";
import type { RoleForm, RoleItem } from "@/types/api";

const props = defineProps<{
  visible: boolean;
  data?: RoleItem | null;
}>();

const emit = defineEmits<{
  "update:visible": [value: boolean];
  done: [];
}>();

const formRef = ref<FormInstance>();
const loading = ref(false);
const formData = reactive<RoleForm>({
  sort: 1,
  status: 1,
});

const title = computed(() => (props.data?.id ? "修改角色" : "新增角色"));

const statusOn = computed<boolean>({
  get: () => formData.status === 1,
  set: (value) => {
    formData.status = value ? 1 : 0;
  },
});

const sortModel = computed<string>({
  get: () => (formData.sort == null ? "" : String(formData.sort)),
  set: (value) => {
    formData.sort = value === "" ? undefined : Number(value);
  },
});

const rules: FormRules = {
  name: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
  code: [{ required: true, message: "请输入角色编码", trigger: "blur" }],
  status: [{ required: true, message: "请选择状态", trigger: "blur" }],
};

function resetForm(): void {
  Object.assign(formData, {
    id: undefined,
    name: undefined,
    code: undefined,
    sort: 1,
    status: 1,
    note: undefined,
  });
  formRef.value?.resetFields();
  formRef.value?.clearValidate();
}

async function openDialog(): Promise<void> {
  resetForm();
  if (props.data) {
    Object.assign(formData, {
      id: props.data.id,
      name: props.data.name,
      code: props.data.code,
      sort: props.data.sort,
      status: props.data.status,
      note: props.data.note,
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

async function handleSubmit(): Promise<void> {
  const valid = await formRef.value?.validate().then(
    () => true,
    () => false
  );
  if (!valid) return;

  loading.value = true;
  try {
    if (formData.id) {
      await RoleAPI.update(formData.id, formData);
      message.success("修改成功");
    } else {
      await RoleAPI.create(formData);
      message.success("新增成功");
    }
    emit("done");
    closeDialog();
  } finally {
    loading.value = false;
  }
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) openDialog();
  }
);
</script>
