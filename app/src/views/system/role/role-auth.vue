<template>
  <AdminAnimalModal
    :visible="visible"
    :title="`【${role?.name ?? ''}】权限分配`"
    width="760px"
    @update:visible="handleVisibleChange"
  >
    <!-- 第一行：搜索 + 已选计数 -->
    <div class="perm-head">
      <Input
        v-model="permKeywords"
        allow-clear
        class="perm-search"
        placeholder="搜索菜单权限名称"
      >
        <template #prefix>
          <SystemIco name="search" :size="13" />
        </template>
      </Input>
      <span class="perm-count">已选 {{ checkedCount }} 项</span>
    </div>

    <!-- 第二行：工具栏 -->
    <div class="perm-toolbar">
      <div class="perm-toolbar__group">
        <Button type="default" size="small" @click="toggleExpand">
          <SystemIco name="chev" :size="12" />
          {{ isExpanded ? "收缩" : "展开" }}
        </Button>
        <Button type="default" size="small" @click="treeRef?.selectAll()">全选</Button>
        <Button type="default" size="small" @click="treeRef?.invertAll()">反选</Button>
        <Button type="default" size="small" @click="treeRef?.clearAll()">清空</Button>
      </div>

      <div class="perm-toolbar__group">
        <label class="linked-switch">
          <span>父子联动</span>
          <Switch v-model="parentChildLinked" size="small" />
        </label>
        <el-tooltip placement="bottom">
          <template #content>
            如果只需勾选菜单权限，不需要联动勾选子菜单/按钮权限，请关闭父子联动
          </template>
          <el-icon class="perm-help">
            <QuestionFilled />
          </el-icon>
        </el-tooltip>
      </div>
    </div>

    <!-- 权限树（动森卡片包裹） -->
    <div v-loading="loading" class="perm-tree-card">
      <AnimalPermTree
        ref="treeRef"
        v-model="checkedPerms"
        :options="menuPermOptions"
        :check-strictly="!parentChildLinked"
        :filter-text="permKeywords"
      />
    </div>

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
import { computed, nextTick, ref, watch } from "vue";

import { Button, Input, Switch } from "animal-island-vue";
import AdminAnimalModal from "@/components/AdminPage/AdminAnimalModal.vue";
import AnimalPermTree from "@/components/AnimalPermTree/index.vue";
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

const treeRef = ref<InstanceType<typeof AnimalPermTree>>();
const loading = ref(false);
const menuPermOptions = ref<OptionItem[]>([]);
const checkedPerms = ref<(string | number)[]>([]);
const permKeywords = ref("");
const isExpanded = ref(true);
const parentChildLinked = ref(true);

const checkedCount = computed(() => checkedPerms.value.length);

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
    checkedPerms.value = permList.filter((item) => item.checked).map((item) => item.id);
    await nextTick();
  } finally {
    loading.value = false;
  }
}

function closeDrawer(): void {
  emit("update:visible", false);
  menuPermOptions.value = [];
  checkedPerms.value = [];
  permKeywords.value = "";
  isExpanded.value = true;
  parentChildLinked.value = true;
}

function handleVisibleChange(value: boolean): void {
  if (!value) closeDrawer();
}

function toggleExpand(): void {
  isExpanded.value = !isExpanded.value;
  if (isExpanded.value) treeRef.value?.expandAll();
  else treeRef.value?.collapseAll();
}

async function handleSubmit(): Promise<void> {
  const roleId = props.role?.id;
  if (!roleId) return;

  const checkedMenuIds = (treeRef.value?.getCheckedKeys(true) ?? []).map((v) => Number(v));

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

watch(
  () => props.visible,
  (visible) => {
    if (visible) openDrawer();
  }
);
</script>

<style scoped lang="scss">
.perm-head {
  display: flex;
  align-items: center;
  gap: 12px;
}
.perm-search {
  flex: 1;
}
.perm-count {
  flex-shrink: 0;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 800;
  color: var(--ai-primary-active, var(--ai-primary-active));
  background: var(--ai-primary-bg, var(--ai-primary-bg));
  border-radius: 999px;
}

.perm-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
}
.perm-toolbar__group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.linked-switch {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: var(--ai-text-2, var(--ai-text-2));
  cursor: pointer;
}
.perm-help {
  color: var(--ai-primary, var(--ai-primary));
  cursor: pointer;
}

.perm-tree-card {
  max-height: 46vh;
  margin-top: 14px;
  padding: 10px 8px;
  overflow-y: auto;
  background: var(--ai-paper);
  border: 2px solid var(--ai-border, var(--ai-border));
  border-radius: 18px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #f7f5ee;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: #e6dfcb;
    border-radius: 10px;
    &:hover {
      background: #c8bd9f;
    }
  }
}
</style>
