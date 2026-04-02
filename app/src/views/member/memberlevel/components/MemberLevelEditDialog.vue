<template>
  <AppDialog
    :visible="visible"
    :title="isEditing ? '修改会员等级' : '添加会员等级'"
    width="520px"
    destroy-on-close
    :lock-scroll="false"
    custom-class="member-level-dialog"
    @update:visible="handleVisibleChange"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="88px"
      class="member-level-dialog__form"
    >
      <div class="member-level-dialog__desc">
        维护会员等级名称与排序号，当前只按远端已确认的最小写模型迁移，不额外扩展 Vue2 历史字段。
      </div>

      <el-form-item
        label="等级名称"
        prop="name"
      >
        <el-input
          v-model="form.name"
          clearable
          maxlength="25"
          placeholder="请输入等级名称"
        />
      </el-form-item>

      <el-form-item
        label="排序号"
        prop="sort"
      >
        <el-input-number
          v-model="form.sort"
          :min="0"
          :max="99999"
          controls-position="right"
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
import type { MemberLevelFormValue } from '@/types/member-level'

const props = defineProps<{
  visible: boolean
  value: MemberLevelFormValue
  isEditing: boolean
  submitting: boolean
}>()

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void
  (event: 'submit', value: MemberLevelFormValue): void
}>()

const formRef = ref<FormInstance>()
const form = reactive<MemberLevelFormValue>({
  name: '',
  sort: 0,
})

/** 把父组件传入的表单值同步到弹窗内部状态，供新增重置和编辑回填共用。 */
function applyValue(value: MemberLevelFormValue): void {
  form.id = value.id
  form.name = value.name
  form.sort = value.sort
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

const rules: FormRules<MemberLevelFormValue> = {
  name: [
    {
      required: true,
      message: '请输入等级名称',
      trigger: 'blur',
    },
  ],
  sort: [
    {
      required: true,
      message: '请输入排序号',
      trigger: 'change',
    },
  ],
}

/** 把弹窗显隐状态回传给父组件，供取消关闭或外部控制弹窗时调用。 */
function handleVisibleChange(nextVisible: boolean): void {
  emit('update:visible', nextVisible)
}

/** 校验当前表单并把整理后的数据提交给父组件，供点击“保存”按钮时调用。 */
async function submit(): Promise<void> {
  const valid = await formRef.value?.validate().catch(() => false)

  if (!valid) {
    return
  }

  emit('submit', {
    id: form.id,
    name: form.name.trim(),
    sort: Number(form.sort ?? 0),
  })
}
</script>

<style scoped>
.member-level-dialog__form {
  padding-top: 4px;
}

.member-level-dialog__desc {
  margin-bottom: 16px;
  font-size: 12px;
  line-height: 1.6;
  color: #64748b;
}
</style>
