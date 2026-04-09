<template>
  <div class="app-container p-6">
    <el-row :gutter="20">
      <!-- 左侧个人信息卡片 -->
      <el-col :xs="24" :sm="24" :md="8" :lg="8">
        <el-card shadow="hover" class="user-card text-center mb-5">
          <div class="avatar-container mb-4 relative inline-block">
            <el-avatar :size="120" :src="userProfile.avatar" class="shadow-md" />
            <el-button
              type="primary"
              size="small"
              circle
              icon="Camera"
              class="absolute bottom-0 right-0 border-2 border-white"
              @click="triggerFileUpload"
            />
            <input
              ref="fileInput"
              type="file"
              style="display: none"
              accept="image/*"
              @change="handleFileChange"
            />
          </div>
          <div class="user-names mb-4">
            <h2 class="text-xl font-bold mb-1">{{ userProfile.member?.nickname || userProfile.nickname || "未设置昵称" }}</h2>
            <div class="text-sm text-[--el-text-color-secondary]">
              {{ userProfile.roles?.join(', ') || '普通用户' }}
            </div>
          </div>
          <el-divider />
          <el-descriptions :column="1" size="small" border>
            <el-descriptions-item label="用户名">
              <el-icon class="mr-1"><User /></el-icon>
              {{ userProfile.username }}
            </el-descriptions-item>
            <el-descriptions-item label="手机号">
              <el-icon class="mr-1"><Iphone /></el-icon>
              {{ userProfile.phone || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="邮箱">
              <el-icon class="mr-1"><Message /></el-icon>
              {{ userProfile.email || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              <el-icon class="mr-1"><Timer /></el-icon>
              {{ userProfile.createTime }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <!-- 右侧编辑区 -->
      <el-col :xs="24" :sm="24" :md="16" :lg="16">
        <el-card shadow="hover">
          <template #header>
            <span class="font-bold">基本信息</span>
          </template>
          <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            label-width="100px"
            v-loading="loading"
          >
            <el-form-item label="用户昵称" prop="nickname">
              <el-input v-model="formData.nickname" placeholder="请输入昵称" maxlength="50" />
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="formData.phone" placeholder="请输入手机号" />
            </el-form-item>
            <el-form-item label="电子邮箱" prop="email">
              <el-input v-model="formData.email" placeholder="请输入电子邮箱" />
            </el-form-item>
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="formData.gender">
                <el-radio :label="1">男</el-radio>
                <el-radio :label="2">女</el-radio>
                <el-radio :label="0">未知</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="联系地址" prop="address">
              <el-input v-model="formData.address" placeholder="请输入地址" />
            </el-form-item>
            <el-form-item label="个人简介" prop="intro">
              <el-input
                v-model="formData.intro"
                type="textarea"
                :rows="4"
                placeholder="请输入个人简介"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSubmit">保存修改</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import UserAPI from "@/api/system/user";
import FileAPI from "@/api/file";
import { useUserStore } from "@/store/modules/user";
import { Camera, User, Iphone, Message, Timer } from "@element-plus/icons-vue";

defineOptions({ name: "Profile" });

const userStore = useUserStore();
const loading = ref(false);
const userProfile = ref<any>({});
const fileInput = ref<HTMLInputElement | null>(null);
const formRef = ref<FormInstance>();

const formData = reactive({
  nickname: "",
  phone: "",
  email: "",
  gender: 0,
  address: "",
  intro: "",
});

const rules: FormRules = {
  nickname: [{ required: true, message: "昵称不能为空", trigger: "blur" }],
  email: [{ type: "email", message: "邮箱格式不正确", trigger: "blur" }],
};

async function loadProfile() {
  loading.value = true;
  try {
    const data = await UserAPI.getProfile();
    userProfile.value = data;
    
    // 填充表单
    formData.nickname = data.member?.nickname || data.nickname || "";
    formData.phone = data.phone || "";
    formData.email = data.email || "";
    formData.gender = data.member?.gender ?? 0;
    formData.address = data.member?.address || "";
    formData.intro = data.member?.intro || "";
  } finally {
    loading.value = false;
  }
}

function triggerFileUpload() {
  fileInput.value?.click();
}

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files ? target.files[0] : null;
  if (file) {
    loading.value = true;
    try {
      const data = await FileAPI.uploadFile(file);
      await UserAPI.updateProfile({ avatar: data.url });
      ElMessage.success("头像更新成功");
      // 更新本地状态
      userProfile.value.avatar = data.url;
      userStore.userInfo.avatar = data.url;
    } catch (error) {
      console.error("Avatar upload failed", error);
    } finally {
      loading.value = false;
    }
  }
}

async function handleSubmit() {
  await formRef.value?.validate();
  loading.value = true;
  try {
    await UserAPI.updateProfile(formData);
    ElMessage.success("个人资料保存成功");
    // 更新 store
    userStore.userInfo.nickname = formData.nickname;
    await loadProfile();
  } catch (error) {
    console.error("Failed to update profile", error);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadProfile();
});
</script>

<style lang="scss" scoped>
.user-card {
  .avatar-container {
    &:hover .el-button {
      background-color: var(--el-color-primary);
    }
  }
}
</style>
