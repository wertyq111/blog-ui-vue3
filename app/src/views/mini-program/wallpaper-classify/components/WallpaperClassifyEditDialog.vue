<template>
  <AppDialog
    :visible="visible"
    :title="isEditing ? '修改壁纸分类' : '添加壁纸分类'"
    width="520px"
    destroy-on-close
    :lock-scroll="false"
    custom-class="wallpaper-classify-edit-dialog"
    @update:visible="handleVisibleChange"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="96px"
      class="wallpaper-classify-edit-dialog__form"
    >
      <el-form-item
        label="分类名称"
        prop="name"
      >
        <el-input
          v-model="form.name"
          maxlength="25"
          clearable
          placeholder="请输入分类名称"
        />
      </el-form-item>

      <el-form-item
        label="封面地址"
        prop="picUrl"
      >
        <el-input
          v-model="form.picUrl"
          clearable
          placeholder="请输入封面图片 URL"
        />
      </el-form-item>

      <el-form-item
        label="排序"
        prop="sort"
      >
        <el-input-number
          v-model="form.sort"
          :min="0"
          controls-position="right"
          class="wallpaper-classify-edit-dialog__sort"
        />
      </el-form-item>

      <el-form-item label="是否推荐">
        <el-switch v-model="form.select" />
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
import type { WallpaperClassifyFormValue } from '@/types/wallpaper-classify'

const props = defineProps<{
  visible: boolean
  value: WallpaperClassifyFormValue
  isEditing: boolean
  submitting: boolean
}>()

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void
  (event: 'submit', value: WallpaperClassifyFormValue): void
}>()

const formRef = ref<FormInstance>()
const form = reactive<WallpaperClassifyFormValue>({
  name: '',
  picUrl: '',
  select: false,
  sort: 0,
})

function applyValue(value: WallpaperClassifyFormValue): void {
  form.id = value.id
  form.name = value.name
  form.picUrl = value.picUrl
  form.select = value.select
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

const rules: FormRules<WallpaperClassifyFormValue> = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  picUrl: [{ required: true, message: '请输入封面地址', trigger: 'blur' }],
  sort: [{ required: true, type: 'number', message: '请输入排序号', trigger: 'change' }],
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
    name: form.name.trim(),
    picUrl: form.picUrl.trim(),
    select: form.select,
    sort: form.sort,
  })
}
</script>

<style scoped>
.wallpaper-classify-edit-dialog__sort {
  width: 180px;
}
</style>
