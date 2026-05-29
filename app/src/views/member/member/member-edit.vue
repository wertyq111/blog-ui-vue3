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
      <div class="field-desc">维护注册会员的资料、等级与账户状态。</div>
      <el-form-item label="关联用户" prop="userId" :required="!props.data">
        <AnimalSelect
          v-if="!props.data"
          v-model="userModel"
          placeholder="请选择要关联的用户"
          :options="userSelectOptions"
          filterable
        />
        <span v-else class="associated-user">{{ associatedUsername }}</span>
      </el-form-item>
      <el-row :gutter="15">
        <el-col :sm="12">
          <el-form-item label="昵称" prop="nickname">
            <Input
              v-model="formData.nickname"
              placeholder="请输入昵称"
              :maxlength="50"
              allow-clear
            />
          </el-form-item>
          <el-form-item label="真实姓名" prop="realname">
            <Input
              v-model="formData.realname"
              placeholder="请输入真实姓名"
              :maxlength="50"
              allow-clear
            />
          </el-form-item>
          <el-form-item label="性别" prop="gender">
            <AnimalSelect v-model="genderModel" placeholder="请选择性别" :options="genderOptions" />
          </el-form-item>
          <el-form-item label="会员等级" prop="memberLevel" required>
            <AnimalSelect
              v-model="levelModel"
              placeholder="请选择会员等级"
              :options="levelSelectOptions"
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
          <el-form-item label="生日" prop="birthday">
            <AnimalDatePicker
              v-model="birthdayModel"
              type="date"
              placeholder="请选择生日"
              style="width: 100%"
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
      <el-form-item label="头像" prop="avatar">
        <single-upload v-model="formData.avatar" />
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
import { Button, Input, Switch } from "animal-island-vue";
import AnimalSelect from "@/components/AnimalSelect/index.vue";
import AnimalDatePicker from "@/components/AnimalDatePicker/index.vue";
import MemberAPI from "@/api/member/member";
import MemberLevelAPI from "@/api/member/member-level";
import UserAPI from "@/api/system/user";
import type { MemberForm, MemberItem, UnboundUser } from "@/types/api";

const props = defineProps<{
  visible: boolean;
  data?: MemberItem | null;
  presetUserId?: number;
}>();

const emit = defineEmits<{
  "update:visible": [value: boolean];
  done: [];
}>();

const formRef = ref<FormInstance>();
const loading = ref(false);
const levelOptions = ref<Array<{ label: string; value: number }>>([]);
const unboundUsers = ref<UnboundUser[]>([]);

const initialFormData: MemberForm = {
  userId: undefined,
  nickname: "",
  realname: "",
  gender: 3,
  avatar: "",
  birthday: undefined,
  memberLevel: 0,
  phone: "",
  status: 1,
};

const formData = reactive<MemberForm>({ ...initialFormData });

const title = computed(() => (props.data ? "编辑会员" : "新增会员"));

const genderOptions = [
  { key: "1", label: "男" },
  { key: "2", label: "女" },
  { key: "3", label: "保密" },
];

const levelSelectOptions = computed(() =>
  levelOptions.value.map((item) => ({ key: String(item.value), label: item.label }))
);

const userSelectOptions = computed(() =>
  unboundUsers.value.map((user) => ({
    key: String(user.id),
    label: user.phone ? `${user.username}（${user.phone}）` : user.username,
  }))
);

// 编辑态展示已关联用户名（列表带 include=user 时有 user.username）
const associatedUsername = computed(
  () => props.data?.user?.username ?? (formData.userId ? `用户 #${formData.userId}` : "-")
);

const userModel = computed<string>({
  get: () => (formData.userId ? String(formData.userId) : ""),
  set: (value) => {
    formData.userId = value === "" ? undefined : Number(value);
    applyUserPrefill(formData.userId);
  },
});

// 选定关联用户后，用其账号/手机号预填会员资料（可再修改）
function applyUserPrefill(userId?: number): void {
  if (!userId) return;
  const user = unboundUsers.value.find((item) => item.id === userId);
  if (!user) return;
  formData.nickname = user.username;
  if (user.phone) formData.phone = user.phone;
}

const genderModel = computed<string>({
  get: () => String(formData.gender ?? 3),
  set: (value) => {
    formData.gender = Number(value);
  },
});

const levelModel = computed<string>({
  get: () => (formData.memberLevel ? String(formData.memberLevel) : ""),
  set: (value) => {
    formData.memberLevel = value === "" ? 0 : Number(value);
  },
});

const statusOn = computed<boolean>({
  get: () => formData.status === 1,
  set: (value) => {
    formData.status = value ? 1 : 0;
  },
});

// 生日后端存秒级时间戳，date-picker 用 Date 对象，提交时转回秒
const birthdayModel = computed<Date | null>({
  get: () => (formData.birthday ? new Date(formData.birthday * 1000) : null),
  set: (value) => {
    formData.birthday = value ? Math.floor(value.getTime() / 1000) : undefined;
  },
});

const rules: FormRules = {
  userId: [
    {
      trigger: "change",
      validator: (_rule, _value, callback) => {
        // 仅新增态校验关联用户；编辑态不可改关联
        if (!props.data && !formData.userId) return callback(new Error("请选择关联用户"));
        callback();
      },
    },
  ],
  nickname: [{ required: true, message: "请输入昵称", trigger: "blur" }],
  memberLevel: [
    {
      trigger: "change",
      validator: (_rule, _value, callback) => {
        if (!formData.memberLevel) return callback(new Error("请选择会员等级"));
        callback();
      },
    },
  ],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号码", trigger: "blur" }],
};

function resetForm(): void {
  Object.assign(formData, { ...initialFormData, id: undefined });
  formRef.value?.resetFields();
  formRef.value?.clearValidate();
}

async function loadLevelOptions(): Promise<void> {
  levelOptions.value = await MemberLevelAPI.getOptions();
}

async function loadUnboundUsers(): Promise<void> {
  unboundUsers.value = await UserAPI.getUnboundUsers();
}

async function openDialog(): Promise<void> {
  resetForm();
  loading.value = true;
  try {
    await loadLevelOptions();
    if (props.data) {
      Object.assign(formData, {
        id: props.data.id,
        userId: props.data.userId,
        nickname: props.data.nickname,
        realname: props.data.realname,
        gender: props.data.gender,
        avatar: props.data.avatar,
        birthday: props.data.birthday,
        memberLevel: props.data.memberLevel,
        phone: props.data.phone,
        status: props.data.status,
      });
    } else {
      await loadUnboundUsers();
      if (props.presetUserId) {
        formData.userId = props.presetUserId;
        applyUserPrefill(props.presetUserId);
      }
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
      // 编辑态不修改关联用户，剔除 userId 避免覆盖后端关联
      const { userId, ...payload } = formData;
      await MemberAPI.update(formData.id, payload as MemberForm);
      message.success("修改会员成功");
    } else {
      await MemberAPI.create(formData);
      message.success("新增会员成功");
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
