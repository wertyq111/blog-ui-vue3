<template>
  <AppDialog
    :visible="visible"
    :title="isEditing ? '修改相册' : '添加相册'"
    width="520px"
    destroy-on-close
    :lock-scroll="false"
    custom-class="photo-category-dialog"
    @update:visible="handleVisibleChange"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="88px"
      class="photo-category-dialog__form"
    >
      <div class="photo-category-dialog__desc">
        维护小程序相册分类名称。当前按后端已确认契约迁移，不额外固化 Vue2 历史排序字段。
      </div>

      <el-form-item
        label="相册名称"
        prop="name"
      >
        <el-input
          v-model="form.name"
          clearable
          maxlength="25"
          placeholder="请输入相册名称"
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
import type { PhotoCategoryFormValue } from '@/types/photo-category'

const props = defineProps<{
  visible: boolean
  value: PhotoCategoryFormValue
  isEditing: boolean
  submitting: boolean
}>()

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void
  (event: 'submit', value: PhotoCategoryFormValue): void
}>()

const formRef = ref<FormInstance>()
const form = reactive<PhotoCategoryFormValue>({
  name: '',
})

/** 把父组件传入的表单值同步到弹窗内部状态，供新增重置和编辑回填共用。 */
function applyValue(value: PhotoCategoryFormValue): void {
  form.id = value.id
  form.name = value.name
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

const rules: FormRules<PhotoCategoryFormValue> = {
  name: [
    {
      required: true,
      message: '请输入相册名称',
      trigger: 'blur',
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
  })
}
</script>

<style scoped>
.photo-category-dialog__form {
  padding-top: 4px;
}

.photo-category-dialog__desc {
  margin-bottom: 16px;
  font-size: 12px;
  line-height: 1.6;
  color: #64748b;
}
</style>
