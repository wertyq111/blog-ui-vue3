<template>
  <AdminAnimalModal
    :visible="visible"
    :title="title"
    width="680px"
    @update:visible="handleVisibleChange"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="82px"
      class="develop-dialog-form"
    >
      <div class="field-desc">维护后台账号、角色和状态，保证访问权限一致。</div>
      <el-row :gutter="15">
        <el-col :sm="12">
          <el-form-item label="邮箱" prop="email">
            <Input v-model="formData.email" placeholder="请输入邮箱" :maxlength="100" allow-clear />
          </el-form-item>
          <el-form-item label="用户账号" prop="username">
            <Input
              v-model="formData.username"
              :readonly="!!formData.id"
              placeholder="请输入用户账号"
              :maxlength="20"
              allow-clear
            />
          </el-form-item>
          <el-form-item label="登录密码" prop="password">
            <Input
              v-model="formData.password"
              type="password"
              placeholder="请输入登录密码"
              :maxlength="20"
            />
          </el-form-item>
        </el-col>
        <el-col :sm="12">
          <el-form-item label="手机号" prop="phone">
            <Input
              v-model="formData.phone"
              placeholder="请输入手机号"
              :maxlength="11"
              allow-clear
            />
          </el-form-item>
          <el-form-item label="角色" prop="roleIds">
            <AnimalMultiSelect
              v-model="roleIdsModel"
              :options="roleSelectOptions"
              placeholder="请选择角色"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <Switch v-model="statusOn">
              <template #checked>正常</template>
              <template #unchecked>禁用</template>
            </Switch>
          </el-form-item>
        </el-col>
      </el-row>
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
import { Button, Input, Switch } from "animal-island-vue";
import AnimalMultiSelect from "@/components/AnimalMultiSelect/index.vue";
import UserAPI from "@/api/system/user";
import type { UserForm } from "@/types/api";
import { CommonStatus } from "@/enums";

const props = defineProps<{
  visible: boolean;
  userId?: string;
}>();

const emit = defineEmits<{
  "update:visible": [value: boolean];
  done: [];
}>();

const formRef = ref<FormInstance>();
const loading = ref(false);
const roleOptions = ref<Array<{ label: string; value: string | number }>>([]);

const initialFormData: UserForm = {
  status: CommonStatus.ENABLED,
  roleIds: [],
};

const formData = reactive<UserForm>({ ...initialFormData });

const title = computed(() => (props.userId ? "修改用户" : "新增用户"));

const roleSelectOptions = computed(() =>
  roleOptions.value.map((item) => ({ key: String(item.value), label: item.label }))
);

const roleIdsModel = computed<string[]>({
  get: () => (formData.roleIds ?? []).map((id) => String(id)),
  set: (keys) => {
    formData.roleIds = keys.map((key) => Number(key));
  },
});

const statusOn = computed<boolean>({
  get: () => formData.status === CommonStatus.ENABLED,
  set: (value) => {
    formData.status = value ? CommonStatus.ENABLED : CommonStatus.DISABLED;
  },
});

const rules: FormRules = {
  username: [{ required: true, message: "请输入用户账号", trigger: "blur" }],
  password: [
    {
      trigger: "blur",
      validator: (_rule, value, callback) => {
        if (!formData.id && !value) return callback(new Error("请输入登录密码"));
        if (value && value.length < 6) return callback(new Error("密码至少 6 位"));
        callback();
      },
    },
  ],
  roleIds: [{ required: true, message: "请选择用户角色", trigger: "change" }],
  email: [{ type: "email", message: "请输入正确的邮箱地址", trigger: "blur" }],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号码", trigger: "blur" }],
};

function resetForm(): void {
  Object.assign(formData, {
    id: undefined,
    username: undefined,
    phone: undefined,
    email: undefined,
    password: undefined,
    status: CommonStatus.ENABLED,
    roleIds: [],
  });
  formRef.value?.resetFields();
  formRef.value?.clearValidate();
}

async function loadRoleOptions(): Promise<void> {
  const options = await UserAPI.getOptions();
  roleOptions.value = options.map((item: any) => ({
    label: item.name ?? item.label,
    value: item.id ?? item.value,
  }));
}

async function openDialog(): Promise<void> {
  resetForm();
  loading.value = true;
  try {
    await loadRoleOptions();
    if (props.userId) {
      const data = await UserAPI.getFormData(props.userId);
      Object.assign(formData, {
        ...data,
        password: "",
        roleIds: data.roleIds ?? [],
      });
    }
    await nextTick();
    formRef.value?.clearValidate();
  } finally {
    loading.value = false;
  }
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
      const payload: UserForm = { ...formData };
      if (!payload.password) delete payload.password;
      await UserAPI.update(formData.id, payload);
      message.success("修改用户成功");
    } else {
      await UserAPI.create(formData);
      message.success("新增用户成功");
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
