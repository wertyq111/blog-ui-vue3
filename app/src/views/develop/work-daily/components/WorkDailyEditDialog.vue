<template>
  <AppDialog
    :visible="visible"
    :title="isEditing ? '修改日常' : '添加日常'"
    width="920px"
    destroy-on-close
    :lock-scroll="false"
    custom-class="work-daily-edit-dialog"
    @update:visible="handleVisibleChange"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="90px"
      class="work-daily-edit-dialog__form"
    >
      <el-row :gutter="16">
        <el-col :md="12">
          <el-form-item
            label="日期"
            prop="logDate"
          >
            <el-date-picker
              v-model="form.logDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="请选择日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>

        <el-col :md="12">
          <div class="work-daily-edit-dialog__actions">
            <el-button
              type="primary"
              plain
              @click="addPlatformRow()"
            >
              添加平台内容
            </el-button>
          </div>
        </el-col>
      </el-row>

      <el-form-item
        label="平台内容"
        prop="platforms"
      >
        <div class="work-daily-edit-dialog__list">
          <div
            v-for="(item, index) in form.platforms"
            :key="index"
            class="work-daily-edit-dialog__item"
          >
            <div class="work-daily-edit-dialog__item-head">
              <span>第 {{ index + 1 }} 条</span>
              <el-button
                link
                type="danger"
                @click="removePlatformRow(index)"
              >
                删除
              </el-button>
            </div>

            <el-row :gutter="16">
              <el-col :md="12">
                <el-form-item
                  :label="`平台 ${index + 1}`"
                  :prop="`platforms.${index}.platformId`"
                >
                  <el-select
                    v-model="item.platformId"
                    clearable
                    filterable
                    placeholder="选择已存在平台，或留空填写临时平台"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="option in platforms"
                      :key="option.id"
                      :label="option.name"
                      :value="option.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :md="12">
                <el-form-item :label="`临时平台 ${index + 1}`">
                  <el-input
                    v-model="item.platformName"
                    clearable
                    maxlength="50"
                    placeholder="未选择平台时可填写临时平台名"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item
              :label="`内容 ${index + 1}`"
              :prop="`platforms.${index}.content`"
            >
              <el-input
                v-model="item.content"
                :rows="6"
                type="textarea"
                placeholder="请输入 Markdown 内容"
              />
            </el-form-item>
          </div>
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
import type { WorkDailyFormValue, WorkDailyPlatformEntry, WorkDailyPlatformOption } from '@/types/work-daily'

const props = defineProps<{
  visible: boolean
  value: WorkDailyFormValue
  platforms: WorkDailyPlatformOption[]
  isEditing: boolean
  submitting: boolean
}>()

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void
  (event: 'submit', value: WorkDailyFormValue): void
}>()

const formRef = ref<FormInstance>()
const form = reactive<WorkDailyFormValue>({
  logDate: '',
  platforms: [],
})

function createPlatformRow(seed: Partial<WorkDailyPlatformEntry> = {}): WorkDailyPlatformEntry {
  return {
    platformId: seed.platformId ?? null,
    platformName: seed.platformName ?? '',
    content: seed.content ?? '',
  }
}

function applyValue(value: WorkDailyFormValue): void {
  form.id = value.id
  form.logDate = value.logDate
  form.platforms = value.platforms.length > 0
    ? value.platforms.map((item) => createPlatformRow(item))
    : [createPlatformRow()]
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

const rules: FormRules<WorkDailyFormValue> = {
  logDate: [{ required: true, message: '请选择日期', trigger: 'change' }],
  platforms: [
    {
      validator: (_rule, value: WorkDailyPlatformEntry[], callback) => {
        if (!Array.isArray(value) || value.length === 0) {
          callback(new Error('请至少填写一条平台内容'))
          return
        }

        const invalidEntry = value.find((item) => {
          const hasPlatform = item.platformId !== null && item.platformId !== ''
          const hasPlatformName = item.platformName.trim().length > 0
          const hasContent = item.content.trim().length > 0

          return (!hasPlatform && !hasPlatformName) || !hasContent
        })

        if (invalidEntry) {
          callback(new Error('每条记录都需要平台信息和内容'))
          return
        }

        callback()
      },
      trigger: 'change',
    },
  ],
}

function addPlatformRow(): void {
  form.platforms.push(createPlatformRow())
}

function removePlatformRow(index: number): void {
  if (form.platforms.length === 1) {
    form.platforms.splice(0, 1, createPlatformRow())
    return
  }

  form.platforms.splice(index, 1)
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
    logDate: form.logDate,
    platforms: form.platforms.map((item) => ({
      platformId: item.platformId === '' ? null : item.platformId,
      platformName: item.platformName.trim(),
      content: item.content.trim(),
    })),
  })
}
</script>

<style scoped>
.work-daily-edit-dialog__form {
  padding-top: 4px;
}

.work-daily-edit-dialog__actions {
  display: flex;
  justify-content: flex-end;
}

.work-daily-edit-dialog__list {
  display: grid;
  gap: 16px;
  width: 100%;
}

.work-daily-edit-dialog__item {
  padding: 16px;
  border: 1px solid rgba(148, 163, 184, 0.26);
  border-radius: 16px;
  background: rgba(248, 250, 252, 0.88);
}

.work-daily-edit-dialog__item-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-weight: 600;
}
</style>
