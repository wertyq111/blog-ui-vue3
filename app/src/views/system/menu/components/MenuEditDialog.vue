<template>
  <AppDialog
    :visible="visible"
    :title="isEditing ? '修改菜单' : '添加菜单'"
    width="760px"
    destroy-on-close
    :lock-scroll="false"
    custom-class="system-menu-edit-dialog"
    @update:visible="handleVisibleChange"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="92px"
      class="system-menu-edit-dialog__form"
    >
      <el-row :gutter="16">
        <el-col :sm="12">
          <el-form-item label="上级菜单">
            <el-tree-select
              v-model="form.pid"
              :data="menuOptions"
              clearable
              check-strictly
              :render-after-expand="false"
              :props="menuOptionProps"
              style="width: 100%"
              placeholder="请选择上级菜单"
            />
          </el-form-item>

          <el-form-item
            label="菜单名称"
            prop="title"
          >
            <el-input
              v-model="form.title"
              clearable
              maxlength="25"
              placeholder="请输入菜单名称"
            />
          </el-form-item>

          <el-form-item label="菜单图标">
            <el-input
              v-model="form.icon"
              :disabled="form.type === 1"
              clearable
              maxlength="60"
              placeholder="请输入图标 class"
            />
          </el-form-item>

          <el-form-item label="权限标识">
            <el-input
              v-model="form.permission"
              clearable
              maxlength="120"
              :disabled="form.type === 0"
              placeholder="例如：sys:menu:edit"
            />
          </el-form-item>
        </el-col>

        <el-col :sm="12">
          <el-form-item label="菜单类型">
            <el-radio-group
              v-model="form.type"
              @change="handleMenuTypeChange"
            >
              <el-radio :label="0">
                菜单
              </el-radio>
              <el-radio :label="1">
                按钮
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="打开方式">
            <el-radio-group
              v-model="form.target"
              :disabled="form.type === 1"
              @change="handleTargetChange"
            >
              <el-radio :label="0">
                组件
              </el-radio>
              <el-radio :label="1">
                内链
              </el-radio>
              <el-radio :label="2">
                外链
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item
            :label="form.target === 2 ? '外链地址' : '路由地址'"
            prop="path"
          >
            <el-input
              v-model="form.path"
              :disabled="form.type === 1"
              clearable
              maxlength="255"
              :placeholder="form.target === 2 ? '请输入外链地址' : '请输入路由地址'"
            />
          </el-form-item>

          <el-form-item
            :label="form.target === 1 ? '内链地址' : '组件路径'"
            prop="component"
          >
            <el-input
              v-model="form.component"
              :disabled="form.type === 1 || form.target === 2"
              clearable
              maxlength="255"
              :placeholder="form.target === 1 ? '请输入内链地址' : '请输入组件路径'"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :sm="12">
          <el-form-item
            label="状态"
            prop="status"
          >
            <el-radio-group v-model="form.status">
              <el-radio :label="1">
                在用
              </el-radio>
              <el-radio :label="2">
                停用
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item
            label="是否可见"
            prop="hide"
          >
            <el-radio-group
              v-model="form.hide"
              :disabled="form.type === 1"
            >
              <el-radio :label="0">
                显示
              </el-radio>
              <el-radio :label="1">
                隐藏
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>

        <el-col :sm="12">
          <el-form-item
            label="排序"
            prop="sort"
          >
            <el-input-number
              v-model="form.sort"
              :min="0"
              controls-position="right"
              class="system-menu-edit-dialog__sort"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item
        v-if="form.type === 0"
        label="权限节点"
      >
        <el-transfer
          v-model="form.checkedList"
          :data="permissionOptions"
          :titles="['全部节点', '已赋予节点']"
        />
      </el-form-item>

      <el-form-item label="备注">
        <el-input
          v-model="form.note"
          type="textarea"
          :rows="3"
          maxlength="200"
          show-word-limit
          clearable
          placeholder="请输入备注"
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
import type { SystemMenuFormValue, SystemMenuOptionNode, SystemMenuPermissionOption } from '@/types/system-menu'

const props = defineProps<{
  visible: boolean
  value: SystemMenuFormValue
  isEditing: boolean
  submitting: boolean
  menuOptions: SystemMenuOptionNode[]
  permissionOptions: SystemMenuPermissionOption[]
}>()

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void
  (event: 'submit', value: SystemMenuFormValue): void
}>()

const formRef = ref<FormInstance>()
const form = reactive<SystemMenuFormValue>({
  pid: null,
  title: '',
  icon: '',
  path: '',
  component: '',
  target: 0,
  permission: '',
  type: 0,
  status: 1,
  hide: 0,
  sort: 0,
  note: '',
  checkedList: [],
})

const menuOptionProps = {
  value: 'id',
  label: 'label',
  children: 'children',
}

function applyValue(value: SystemMenuFormValue): void {
  form.id = value.id
  form.pid = value.pid
  form.title = value.title
  form.icon = value.icon
  form.path = value.path
  form.component = value.component
  form.target = value.target
  form.permission = value.permission
  form.type = value.type
  form.status = value.status
  form.hide = value.hide
  form.sort = value.sort
  form.note = value.note
  form.checkedList = [...value.checkedList]
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

const rules: FormRules<SystemMenuFormValue> = {
  title: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  status: [{ required: true, type: 'number', message: '请选择状态', trigger: 'change' }],
  hide: [{ required: true, type: 'number', message: '请选择是否可见', trigger: 'change' }],
  sort: [{ required: true, type: 'number', message: '请输入排序', trigger: 'change' }],
}

function handleVisibleChange(nextVisible: boolean): void {
  emit('update:visible', nextVisible)
}

function handleMenuTypeChange(): void {
  if (form.type === 1) {
    form.target = 0
    form.icon = ''
    form.path = ''
    form.component = ''
    form.hide = 1
    form.checkedList = []
    return
  }

  form.hide = form.hide === 1 ? 1 : 0
}

function handleTargetChange(): void {
  if (form.target === 2) {
    form.component = ''
  }
}

async function submit(): Promise<void> {
  const valid = await formRef.value?.validate().catch(() => false)

  if (!valid) {
    return
  }

  emit('submit', {
    id: form.id,
    pid: form.pid,
    title: form.title.trim(),
    icon: form.icon.trim(),
    path: form.path.trim(),
    component: form.component.trim(),
    target: form.target,
    permission: form.permission.trim(),
    type: form.type,
    status: form.status,
    hide: form.hide,
    sort: form.sort,
    note: form.note.trim(),
    checkedList: [...form.checkedList],
  })
}
</script>

<style scoped>
.system-menu-edit-dialog__sort {
  width: 180px;
}
</style>
