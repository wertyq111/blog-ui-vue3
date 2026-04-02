<template>
  <AppDialog
    :visible="visible"
    :title="isEditing ? '修改壁纸' : '添加壁纸'"
    width="760px"
    destroy-on-close
    :lock-scroll="false"
    custom-class="wallpaper-edit-dialog"
    @update:visible="handleVisibleChange"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="96px"
      class="wallpaper-edit-dialog__form"
    >
      <el-form-item
        label="壁纸分类"
        prop="classId"
      >
        <el-select
          v-model="form.classId"
          class="wallpaper-edit-dialog__classify"
          clearable
          filterable
          placeholder="请选择壁纸分类"
        >
          <el-option
            v-for="option in classifyOptions"
            :key="option.id"
            :label="option.name"
            :value="option.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item
        label="发布者"
        prop="nickname"
      >
        <el-input
          v-model="form.nickname"
          maxlength="20"
          clearable
          placeholder="请输入发布者"
        />
      </el-form-item>

      <el-form-item
        label="壁纸地址"
        prop="url"
      >
        <el-input
          v-model="form.url"
          clearable
          placeholder="请输入原图 URL"
        />
      </el-form-item>

      <el-form-item
        label="缩略图地址"
        prop="smallPicUrl"
      >
        <el-input
          v-model="form.smallPicUrl"
          clearable
          placeholder="请输入缩略图 URL"
        >
          <template #append>
            <el-button @click="fillSmallPicFromUrl">
              自动生成
            </el-button>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="描述">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          maxlength="300"
          show-word-limit
          clearable
          placeholder="请输入描述"
        />
      </el-form-item>

      <el-form-item label="评分">
        <el-input-number
          v-model="form.score"
          :min="0"
          :max="5"
          :step="1"
          controls-position="right"
        />
      </el-form-item>

      <el-form-item label="标签">
        <div class="wallpaper-edit-dialog__tags">
          <el-tag
            v-for="tag in form.tags"
            :key="tag"
            closable
            @close="removeTag(tag)"
          >
            {{ tag }}
          </el-tag>
          <el-input
            v-if="tagInputVisible"
            ref="tagInputRef"
            v-model="tagInputValue"
            class="wallpaper-edit-dialog__tag-input"
            size="small"
            placeholder="输入标签"
            @keyup.enter="confirmTag"
            @blur="confirmTag"
          />
          <el-button
            v-else
            size="small"
            @click="showTagInput"
          >
            + 添加标签
          </el-button>
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
import { nextTick, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules, InputInstance } from 'element-plus'

import AppDialog from '@/components/AppDialog.vue'
import type { WallpaperClassifyOption, WallpaperFormValue } from '@/types/wallpaper'

const props = defineProps<{
  visible: boolean
  value: WallpaperFormValue
  isEditing: boolean
  submitting: boolean
  classifyOptions: WallpaperClassifyOption[]
}>()

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void
  (event: 'submit', value: WallpaperFormValue): void
}>()

const formRef = ref<FormInstance>()
const form = reactive<WallpaperFormValue>({
  classId: '',
  nickname: '',
  url: '',
  smallPicUrl: '',
  description: '',
  tags: [],
  score: 0,
})

const tagInputVisible = ref(false)
const tagInputValue = ref('')
const tagInputRef = ref<InputInstance>()

function applyValue(value: WallpaperFormValue): void {
  form.id = value.id
  form.classId = value.classId
  form.nickname = value.nickname
  form.url = value.url
  form.smallPicUrl = value.smallPicUrl
  form.description = value.description
  form.tags = [...value.tags]
  form.score = value.score
}

watch(
  () => props.value,
  (value) => {
    applyValue(value)
    tagInputVisible.value = false
    tagInputValue.value = ''
    formRef.value?.clearValidate()
  },
  {
    deep: true,
    immediate: true,
  },
)

const rules: FormRules<WallpaperFormValue> = {
  classId: [{ required: true, message: '请选择壁纸分类', trigger: 'change' }],
  nickname: [{ required: true, message: '请输入发布者', trigger: 'blur' }],
  url: [{ required: true, message: '请输入壁纸地址', trigger: 'blur' }],
  smallPicUrl: [{ required: true, message: '请输入缩略图地址', trigger: 'blur' }],
  description: [{ required: true, message: '请输入描述', trigger: 'blur' }],
}

function handleVisibleChange(nextVisible: boolean): void {
  emit('update:visible', nextVisible)
}

function fillSmallPicFromUrl(): void {
  const url = form.url.trim()

  if (!url) {
    return
  }

  form.smallPicUrl = `${url}?imageMogr2/thumbnail/!10p`
}

function removeTag(tag: string): void {
  form.tags = form.tags.filter((item) => item !== tag)
}

async function showTagInput(): Promise<void> {
  tagInputVisible.value = true
  await nextTick()
  tagInputRef.value?.focus()
}

function confirmTag(): void {
  const value = tagInputValue.value.trim()

  if (value.length > 0 && !form.tags.includes(value)) {
    form.tags = [...form.tags, value]
  }

  tagInputVisible.value = false
  tagInputValue.value = ''
}

async function submit(): Promise<void> {
  if (!form.smallPicUrl.trim() && form.url.trim()) {
    fillSmallPicFromUrl()
  }

  const valid = await formRef.value?.validate().catch(() => false)

  if (!valid) {
    return
  }

  emit('submit', {
    id: form.id,
    classId: form.classId,
    nickname: form.nickname.trim(),
    url: form.url.trim(),
    smallPicUrl: form.smallPicUrl.trim(),
    description: form.description.trim(),
    tags: [...form.tags],
    score: form.score,
  })
}
</script>

<style scoped>
.wallpaper-edit-dialog__classify {
  width: 260px;
}

.wallpaper-edit-dialog__tags {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.wallpaper-edit-dialog__tag-input {
  width: 120px;
}
</style>
