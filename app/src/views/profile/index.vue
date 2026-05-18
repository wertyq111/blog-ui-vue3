<template>
  <div class="develop-page admin-workspace-page profile-page">
    <el-card shadow="never" class="develop-shell admin-workspace-shell">
      <!-- Hero: 个人中心 -->
      <section class="develop-hero">
        <div class="develop-hero__copy">
          <div class="develop-hero__eyebrow">PROFILE</div>
          <h1 class="develop-hero__title">个人中心</h1>
          <p class="develop-hero__desc">管理你的个人基础信息、头像和账户安全设置。</p>
        </div>
      </section>

      <el-row :gutter="18">
        <!-- 左侧个人信息卡片 -->
        <el-col :xs="24" :sm="24" :md="8" :lg="8">
          <section class="develop-panel user-profile-panel text-center">
            <div class="avatar-wrapper mb-4">
              <el-avatar :size="120" :src="userProfile.avatar" class="profile-avatar" />
              <el-button
                type="primary"
                size="small"
                circle
                icon="Camera"
                class="avatar-upload-btn"
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
            <div class="user-info-brief mb-5">
              <h2 class="user-nickname">{{ userProfile.member?.nickname || userProfile.nickname || "未设置昵称" }}</h2>
              <div class="user-roles">
                <el-tag v-for="role in userProfile.roles" :key="role" size="small" effect="plain" class="mr-1 rounded-pill">
                  {{ role }}
                </el-tag>
                <el-tag v-if="!userProfile.roles?.length" size="small" effect="plain" class="rounded-pill">普通用户</el-tag>
              </div>
            </div>
            
            <el-divider border-style="dashed" />
            
            <el-descriptions :column="1" size="small" class="profile-details">
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
              <el-descriptions-item label="加入时间">
                <el-icon class="mr-1"><Timer /></el-icon>
                {{ userProfile.createTime }}
              </el-descriptions-item>
            </el-descriptions>
          </section>
        </el-col>

        <!-- 右侧编辑区 -->
        <el-col :xs="24" :sm="24" :md="16" :lg="16">
          <section class="develop-panel profile-edit-panel">
            <div class="panel-header mb-5">
              <div class="panel-title">基本信息</div>
              <div class="panel-desc text-xs text-gray-400 mt-1">完善个人资料有助于提升账户识别度。</div>
            </div>
            
            <el-form
              ref="formRef"
              :model="formData"
              :rules="rules"
              label-width="100px"
              v-loading="loading"
              class="develop-form"
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
              <el-form-item class="mt-8">
                <el-button type="primary" @click="handleSubmit">保存资料修改</el-button>
              </el-form-item>
            </el-form>
          </section>
        </el-col>
      </el-row>
    </el-card>
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
.user-profile-panel {
  padding: 32px 24px !important;
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
  
  .profile-avatar {
    border: 4px solid color-mix(in srgb, var(--cyber-panel-strong) 92%, transparent);
    box-shadow: 0 10px 30px color-mix(in srgb, var(--cyber-primary) 18%, transparent);
  }
  
  .avatar-upload-btn {
    position: absolute;
    bottom: 4px;
    right: 4px;
    border: 2px solid color-mix(in srgb, var(--cyber-panel-strong) 92%, transparent);
    box-shadow: 0 4px 10px color-mix(in srgb, var(--cyber-primary) 12%, transparent);
    
    &:hover {
      transform: scale(1.1);
    }
  }
}

.user-nickname {
  font-size: 22px;
  font-weight: 700;
  color: var(--cyber-text);
  margin-bottom: 8px;
}

.user-roles {
  display: flex;
  justify-content: center;
  gap: 6px;
}

.profile-details {
  :deep(.el-descriptions__label) {
    color: var(--cyber-text-muted);
    font-weight: 500;
  }
  :deep(.el-descriptions__content) {
    color: var(--cyber-text);
    font-weight: 600;
  }
}

.profile-edit-panel {
  padding: 28px 32px !important;
}

.panel-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--cyber-text);
}

.rounded-pill {
  border-radius: 999px !important;
}

</style>
