<template>
  <AdminAnimalModal
    :visible="visible"
    :title="`【${role?.name ?? ''}】权限分配`"
    width="760px"
    @update:visible="handleVisibleChange"
  >
    <div class="assign-toolbar">
      <Input v-model="permKeywords" allow-clear class="assign-search" placeholder="菜单权限名称">
        <template #prefix>
          <SystemIco name="search" :size="13" />
        </template>
      </Input>

      <div class="assign-actions">
        <Button type="primary" size="small" @click="togglePermTree">
          <SystemIco name="chev" :size="12" />
          {{ isExpanded ? "收缩" : "展开" }}
        </Button>
        <label class="linked-switch">
          <span>父子联动</span>
          <Switch v-model="parentChildLinked" size="small" />
        </label>

        <el-tooltip placement="bottom">
          <template #content>
            如果只需勾选菜单权限，不需要勾选子菜单或者按钮权限，请关闭父子联动
          </template>
          <el-icon class="ml-1 color-[--el-color-primary] inline-block cursor-pointer">
            <QuestionFilled />
          </el-icon>
        </el-tooltip>
      </div>
    </div>

    <el-tree
      ref="permTreeRef"
      v-loading="loading"
      node-key="value"
      show-checkbox
      :data="menuPermOptions"
      :filter-node-method="handlePermFilter"
      :default-expand-all="true"
      :check-strictly="!parentChildLinked"
      class="mt-5"
    >
      <template #default="{ data }">
        {{ data.label }}
      </template>
    </el-tree>

    <template #footer>
      <div class="develop-dialog-footer">
        <Button
          v-hasPerm="'sys:role:permission'"
          type="primary"
          :loading="loading"
          @click="handleSubmit"
        >
          确定
        </Button>
        <Button type="default" @click="closeDrawer">取消</Button>
      </div>
    </template>
  </AdminAnimalModal>
</template>

<script setup lang="ts">
import { message } from "@/utils/feedback";
import { nextTick, ref, watch } from "vue";

import { Button, Input, Switch } from "animal-island-vue";
import AdminAnimalModal from "@/components/AdminPage/AdminAnimalModal.vue";
import RoleAPI from "@/api/system/role";
import type { BackendPermissionItem, OptionItem, RoleItem } from "@/types/api";
import SystemIco from "@/components/AdminPage/SystemIco.vue";
import { buildOptionTree } from "@/utils/systemManagement";

const props = defineProps<{
  visible: boolean;
  role?: RoleItem | null;
}>();

const emit = defineEmits<{
  "update:visible": [value: boolean];
  done: [];
}>();

const permTreeRef = ref<any>();
const loading = ref(false);
const menuPermOptions = ref<OptionItem[]>([]);
const permKeywords = ref("");
const isExpanded = ref(true);
const parentChildLinked = ref(true);

async function openDrawer(): Promise<void> {
  const roleId = props.role?.id;
  if (!roleId) return;

  loading.value = true;
  try {
    const permList = await RoleAPI.getPermissionList(roleId);
    menuPermOptions.value = buildOptionTree(
      permList.map((item: BackendPermissionItem) => ({
        id: item.id,
        pid: item.pid,
        title: item.title,
      }))
    );

    await nextTick();
    permList
      .filter((item) => item.checked)
      .forEach((item) => permTreeRef.value?.setChecked(item.id, true, false));
  } finally {
    loading.value = false;
  }
}

function closeDrawer(): void {
  emit("update:visible", false);
  menuPermOptions.value = [];
  permKeywords.value = "";
  isExpanded.value = true;
  parentChildLinked.value = true;
}

function handleVisibleChange(value: boolean): void {
  if (!value) closeDrawer();
}

function togglePermTree(): void {
  isExpanded.value = !isExpanded.value;
  if (!permTreeRef.value) return;

  Object.values(permTreeRef.value.store.nodesMap).forEach((node: any) => {
    if (isExpanded.value) node.expand();
    else node.collapse();
  });
}

function handlePermFilter(value: string, data: { [key: string]: any }): boolean {
  if (!value) return true;
  return data.label.includes(value);
}

async function handleSubmit(): Promise<void> {
  const roleId = props.role?.id;
  if (!roleId) return;

  const checkedMenuIds: number[] = permTreeRef
    .value!.getCheckedNodes(false, true)
    .map((node: any) => node.value);

  loading.value = true;
  try {
    await RoleAPI.savePermissions(roleId, checkedMenuIds);
    message.success("分配权限成功");
    emit("done");
    closeDrawer();
  } finally {
    loading.value = false;
  }
}

watch(permKeywords, (value) => {
  permTreeRef.value?.filter(value);
});

watch(
  () => props.visible,
  (visible) => {
    if (visible) openDrawer();
  }
);
</script>
