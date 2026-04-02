<template>
  <AppDialog
    :visible="visible"
    title="分配权限"
    width="520px"
    destroy-on-close
    :lock-scroll="false"
    custom-class="system-role-permission-dialog"
    @update:visible="handleVisibleChange"
  >
    <el-scrollbar
      v-loading="loading"
      height="50vh"
    >
      <el-tree
        ref="treeRef"
        :data="tree"
        node-key="id"
        :props="{
          label: 'title',
          children: 'children',
        }"
        default-expand-all
        show-checkbox
      >
        <template #default="{ data }">
          <span class="system-role-permission-dialog__tree-node">
            <i
              v-if="data.icon"
              :class="data.icon"
            />
            <span>{{ data.title }}</span>
          </span>
        </template>
      </el-tree>
    </el-scrollbar>

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
import { computed, nextTick, ref, watch } from 'vue'
import type { ElTree } from 'element-plus'

import AppDialog from '@/components/AppDialog.vue'
import type { SystemRolePermissionNode } from '@/types/system-role'

const props = defineProps<{
  visible: boolean
  loading: boolean
  submitting: boolean
  tree: SystemRolePermissionNode[]
}>()

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void
  (event: 'submit', value: Array<number | string>): void
}>()

const treeRef = ref<InstanceType<typeof ElTree>>()

function collectCheckedLeafKeys(nodes: SystemRolePermissionNode[]): Array<number | string> {
  const keys: Array<number | string> = []

  for (const node of nodes) {
    const children = node.children ?? []

    if (children.length === 0 && node.checked) {
      keys.push(node.id)
      continue
    }

    keys.push(...collectCheckedLeafKeys(children))
  }

  return keys
}

const checkedLeafKeys = computed(() => collectCheckedLeafKeys(props.tree))

watch(
  () => props.visible,
  async (visible) => {
    if (!visible) {
      return
    }

    await nextTick()
    treeRef.value?.setCheckedKeys(checkedLeafKeys.value)
  },
)

function handleVisibleChange(nextVisible: boolean): void {
  emit('update:visible', nextVisible)
}

function submit(): void {
  const checkedKeys = (treeRef.value?.getCheckedKeys(false) ?? []) as Array<number | string>
  const halfCheckedKeys = (treeRef.value?.getHalfCheckedKeys() ?? []) as Array<number | string>

  emit('submit', [...checkedKeys, ...halfCheckedKeys])
}
</script>

<style scoped>
.system-role-permission-dialog__tree-node {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
</style>
