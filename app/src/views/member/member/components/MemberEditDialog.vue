<template>
  <AppDialog
    :visible="visible"
    title="修改会员"
    width="760px"
    destroy-on-close
    :lock-scroll="false"
    custom-class="member-dialog"
    @update:visible="handleVisibleChange"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="92px"
      class="member-dialog__form"
    >
      <div class="member-dialog__desc">
        当前先收口已验证的会员编辑链路。新增会员依赖 `user_id` 选择链路，等后续单独补齐。
      </div>

      <el-form-item label="会员账号">
        <el-text type="primary">
          {{ form.username || '未关联账号' }}
        </el-text>
      </el-form-item>

      <el-row :gutter="16">
        <el-col :sm="12">
          <el-form-item
            label="会员姓名"
            prop="realname"
          >
            <el-input
              v-model="form.realname"
              clearable
              maxlength="20"
              placeholder="请输入会员姓名"
            />
          </el-form-item>

          <el-form-item
            label="性别"
            prop="gender"
          >
            <el-select
              v-model="form.gender"
              placeholder="请选择性别"
              style="width: 100%"
            >
              <el-option
                v-for="option in genderOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item
            label="设备类型"
            prop="device"
          >
            <el-select
              v-model="form.device"
              placeholder="请选择设备类型"
              style="width: 100%"
            >
              <el-option
                v-for="option in deviceOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item
            label="会员等级"
            prop="memberLevel"
          >
            <el-select
              v-model="form.memberLevel"
              clearable
              filterable
              placeholder="请选择会员等级"
              style="width: 100%"
            >
              <el-option
                v-for="option in memberLevelOptions"
                :key="option.id"
                :label="option.name"
                :value="option.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item
            label="状态"
            prop="status"
          >
            <el-radio-group v-model="form.status">
              <el-radio :label="1">
                在用
              </el-radio>
              <el-radio :label="2">
                禁用
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>

        <el-col :sm="12">
          <el-form-item
            label="会员昵称"
            prop="nickname"
          >
            <el-input
              v-model="form.nickname"
              clearable
              maxlength="20"
              placeholder="请输入会员昵称"
            />
          </el-form-item>

          <el-form-item
            label="出生日期"
            prop="birthday"
          >
            <el-date-picker
              v-model="form.birthday"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="请选择出生日期"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item
            label="注册来源"
            prop="source"
          >
            <el-select
              v-model="form.source"
              placeholder="请选择注册来源"
              style="width: 100%"
            >
              <el-option
                v-for="option in sourceOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="头像地址">
            <el-input
              v-model="form.avatar"
              clearable
              placeholder="请输入七牛头像地址"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :sm="8">
          <el-form-item label="省编码">
            <el-input
              v-model="form.city[0]"
              clearable
              placeholder="province code"
            />
          </el-form-item>
        </el-col>
        <el-col :sm="8">
          <el-form-item label="市编码">
            <el-input
              v-model="form.city[1]"
              clearable
              placeholder="city code"
            />
          </el-form-item>
        </el-col>
        <el-col :sm="8">
          <el-form-item label="区编码">
            <el-input
              v-model="form.city[2]"
              clearable
              placeholder="district code"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="详细地址">
        <el-input
          v-model="form.address"
          clearable
          maxlength="150"
          placeholder="请输入详细地址"
        />
      </el-form-item>

      <el-form-item label="个人简介">
        <el-input
          v-model="form.intro"
          :rows="3"
          type="textarea"
          maxlength="200"
          placeholder="请输入个人简介"
        />
      </el-form-item>

      <el-form-item label="个人签名">
        <el-input
          v-model="form.signature"
          :rows="3"
          type="textarea"
          maxlength="200"
          placeholder="请输入个人签名"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleVisibleChange(false)">
        取消
      </el-button>
      <el-button
        type="primary"
        :loading="submitting"
        @click="submit"
      >
        保存
      </el-button>
    </template>
  </AppDialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

import AppDialog from '@/components/AppDialog.vue'
import type { MemberFormValue, MemberLevelOption } from '@/types/member'

const genderOptions = [
  { label: '男', value: 1 },
  { label: '女', value: 2 },
  { label: '保密', value: 3 },
]

const deviceOptions = [
  { label: '苹果', value: 1 },
  { label: '安卓', value: 2 },
  { label: 'WAP站', value: 3 },
  { label: 'PC站', value: 4 },
  { label: '后台', value: 5 },
]

const sourceOptions = [
  { label: 'APP注册', value: 1 },
  { label: '小程序注册', value: 2 },
  { label: '网站注册', value: 3 },
  { label: 'WAP站注册', value: 4 },
  { label: '马甲会员', value: 5 },
]

const props = defineProps<{
  visible: boolean
  value: MemberFormValue
  submitting: boolean
  memberLevelOptions: MemberLevelOption[]
}>()

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void
  (event: 'submit', value: MemberFormValue): void
}>()

const formRef = ref<FormInstance>()
const form = reactive<MemberFormValue>({
  memberLevel: null,
  realname: '',
  nickname: '',
  gender: 3,
  avatar: '',
  birthday: '',
  city: ['', '', ''],
  address: '',
  intro: '',
  signature: '',
  device: 5,
  source: 2,
  status: 1,
})

/** 把父组件传入的会员表单值同步到弹窗内部状态，供编辑回填时复用。 */
function applyValue(value: MemberFormValue): void {
  form.id = value.id
  form.userId = value.userId ?? null
  form.username = value.username ?? ''
  form.memberLevel = value.memberLevel ?? null
  form.realname = value.realname
  form.nickname = value.nickname
  form.gender = value.gender
  form.avatar = value.avatar
  form.birthday = value.birthday
  form.city = [...value.city]
  form.address = value.address
  form.intro = value.intro
  form.signature = value.signature
  form.device = value.device
  form.source = value.source
  form.status = value.status
}

watch(
  () => props.value,
  (value) => {
    applyValue(value)
    formRef.value?.clearValidate()
  },
  {
    deep: true,
    immediate: true,
  },
)

const rules: FormRules<MemberFormValue> = {
  realname: [
    {
      required: true,
      message: '请输入会员姓名',
      trigger: 'blur',
    },
  ],
  nickname: [
    {
      required: true,
      message: '请输入会员昵称',
      trigger: 'blur',
    },
  ],
  gender: [
    {
      required: true,
      message: '请选择性别',
      trigger: 'change',
    },
  ],
  device: [
    {
      required: true,
      message: '请选择设备类型',
      trigger: 'change',
    },
  ],
  source: [
    {
      required: true,
      message: '请选择注册来源',
      trigger: 'change',
    },
  ],
  status: [
    {
      required: true,
      message: '请选择状态',
      trigger: 'change',
    },
  ],
  memberLevel: [
    {
      required: true,
      message: '请选择会员等级',
      trigger: 'change',
    },
  ],
}

/** 把弹窗显隐状态回传给父组件，供关闭弹窗或外部控制弹窗时调用。 */
function handleVisibleChange(nextVisible: boolean): void {
  emit('update:visible', nextVisible)
}

/** 校验会员表单并把整理后的数据提交给父组件，供点击“保存”按钮时调用。 */
async function submit(): Promise<void> {
  const valid = await formRef.value?.validate().catch(() => false)

  if (!valid) {
    return
  }

  emit('submit', {
    id: form.id,
    userId: form.userId ?? null,
    username: form.username ?? '',
    memberLevel: form.memberLevel,
    realname: form.realname.trim(),
    nickname: form.nickname.trim(),
    gender: form.gender,
    avatar: form.avatar.trim(),
    birthday: form.birthday,
    city: [...form.city],
    address: form.address.trim(),
    intro: form.intro.trim(),
    signature: form.signature.trim(),
    device: form.device,
    source: form.source,
    status: form.status,
  })
}
</script>

<style scoped>
.member-dialog__form {
  padding-top: 4px;
}

.member-dialog__desc {
  margin-bottom: 16px;
  font-size: 12px;
  line-height: 1.6;
  color: #64748b;
}
</style>
