<template>
  <AppDialog
    :visible="visible"
    :title="isEditing ? '修改照片' : '添加照片'"
    width="700px"
    destroy-on-close
    :lock-scroll="false"
    custom-class="photo-edit-dialog"
    @update:visible="handleVisibleChange"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="90px"
      class="photo-edit-dialog__form"
    >
      <el-form-item
        label="相册"
        prop="categoryId"
      >
        <el-select
          v-model="form.categoryId"
          class="photo-edit-dialog__category"
          clearable
          filterable
          placeholder="请选择相册"
        >
          <el-option
            v-for="option in categoryOptions"
            :key="option.id"
            :label="option.name"
            :value="option.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item
        label="图片地址"
        prop="url"
      >
        <el-input
          v-model="form.url"
          clearable
          placeholder="请输入图片 URL"
        />
      </el-form-item>

      <el-form-item label="描述">
        <el-input
          v-model="form.remark"
          type="textarea"
          :rows="3"
          maxlength="200"
          show-word-limit
          clearable
          placeholder="请输入描述"
        />
      </el-form-item>

      <el-form-item label="预览">
        <el-image
          v-if="form.url.trim()"
          :src="form.url.trim()"
          fit="contain"
          class="photo-edit-dialog__preview"
          :preview-src-list="[form.url.trim()]"
          preview-teleported
        />
        <div
          v-else
          class="photo-edit-dialog__preview-empty"
        >
          输入图片地址后可预览
        </div>
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
import type { PhotoCategoryOption, PhotoFormValue } from '@/types/photo'

const props = defineProps<{
  visible: boolean
  value: PhotoFormValue
  isEditing: boolean
  submitting: boolean
  categoryOptions: PhotoCategoryOption[]
}>()

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void
  (event: 'submit', value: PhotoFormValue): void
}>()

const formRef = ref<FormInstance>()
const form = reactive<PhotoFormValue>({
  categoryId: '',
  url: '',
  remark: '',
})

function applyValue(value: PhotoFormValue): void {
  form.id = value.id
  form.categoryId = value.categoryId
  form.url = value.url
  form.remark = value.remark
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

const rules: FormRules<PhotoFormValue> = {
  categoryId: [{ required: true, message: '请选择相册', trigger: 'change' }],
  url: [{ required: true, message: '请输入图片地址', trigger: 'blur' }],
}

function handleVisibleChange(nextVisible: boolean): void {
  emit('update:visible', nextVisible)
}

async function submit(): Promise<void> {
  const valid = await formRef.value?.validate().catch(() => false)

  if (!valid) {
    return
  }

  emit('submit', {
    id: form.id,
    categoryId: form.categoryId,
    url: form.url.trim(),
    remark: form.remark.trim(),
  })
}
</script>

<style scoped>
.photo-edit-dialog__category {
  width: 240px;
}

.photo-edit-dialog__preview {
  width: 240px;
  height: 180px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.photo-edit-dialog__preview-empty {
  color: #64748b;
  font-size: 13px;
}
</style>
