<template>
  <AppDialog
    :visible="visible"
    :title="isEditing ? '修改项目编码' : '添加项目编码'"
    width="760px"
    destroy-on-close
    :lock-scroll="false"
    custom-class="convert-path-edit-dialog"
    @update:visible="handleVisibleChange"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="96px"
      class="convert-path-edit-dialog__form"
    >
      <el-row :gutter="16">
        <el-col :sm="12">
          <el-form-item
            label="项目编码"
            prop="code"
          >
            <el-input
              v-model="form.code"
              clearable
              maxlength="20"
              placeholder="请输入项目编码"
            />
          </el-form-item>
        </el-col>

        <el-col :sm="12">
          <el-form-item
            label="项目名称"
            prop="name"
          >
            <el-input
              v-model="form.name"
              clearable
              maxlength="20"
              placeholder="请输入项目名称"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="项目网址">
        <el-input
          v-model="form.url"
          clearable
          maxlength="255"
          placeholder="可选，默认留空"
        />
      </el-form-item>

      <el-form-item
        label="服务器地址"
        prop="target"
      >
        <el-input
          v-model="form.target"
          clearable
          maxlength="255"
          placeholder="请输入服务器地址"
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
        />
      </el-form-item>

      <div class="convert-path-edit-dialog__section-title">
        来源地址
      </div>
      <div class="convert-path-edit-dialog__section-desc">
        支持配置多个来源前缀，转换时会逐条匹配并替换成目标服务器地址。
      </div>

      <div
        v-for="(_, index) in form.sources"
        :key="index"
        class="convert-path-edit-dialog__source-row"
      >
        <el-form-item
          :label="`来源地址${index + 1}`"
          class="convert-path-edit-dialog__source-item"
        >
          <el-input
            v-model="form.sources[index]"
            clearable
            maxlength="255"
            placeholder="请输入来源地址"
          />
        </el-form-item>
        <el-button
          v-if="index === 0"
          type="primary"
          plain
          @click="addSource"
        >
          添加
        </el-button>
        <el-button
          v-else
          type="danger"
          plain
          @click="removeSource(index)"
        >
          删除
        </el-button>
      </div>
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
import type { ServerPathFormValue } from '@/types/server-path'

const props = defineProps<{
  visible: boolean
  value: ServerPathFormValue
  isEditing: boolean
  submitting: boolean
}>()

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void
  (event: 'submit', value: ServerPathFormValue): void
}>()

const formRef = ref<FormInstance>()
const form = reactive<ServerPathFormValue>({
  code: '',
  name: '',
  url: '',
  target: '',
  sources: [''],
  sort: 0,
})

function applyValue(value: ServerPathFormValue): void {
  form.id = value.id
  form.code = value.code
  form.name = value.name
  form.url = value.url
  form.target = value.target
  form.sources = [...value.sources]
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

const rules: FormRules<ServerPathFormValue> = {
  code: [{ required: true, message: '请输入项目编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  target: [{ required: true, message: '请输入服务器地址', trigger: 'blur' }],
}

function addSource(): void {
  form.sources.push('')
}

function removeSource(index: number): void {
  form.sources.splice(index, 1)

  if (form.sources.length === 0) {
    form.sources.push('')
  }
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
    code: form.code.trim(),
    name: form.name.trim(),
    url: form.url.trim(),
    target: form.target.trim(),
    sources: form.sources.map((item) => item.trim()),
    sort: form.sort,
  })
}
</script>

<style scoped>
.convert-path-edit-dialog__form {
  padding-top: 4px;
}

.convert-path-edit-dialog__section-title {
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #334155;
}

.convert-path-edit-dialog__section-desc {
  margin-bottom: 12px;
  font-size: 12px;
  line-height: 1.6;
  color: #64748b;
}

.convert-path-edit-dialog__source-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.convert-path-edit-dialog__source-item {
  flex: 1;
}
</style>
