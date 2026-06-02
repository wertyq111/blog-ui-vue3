<template>
  <div class="page-card">
    <div class="page-head">
      <div class="page-eyebrow">SYSTEM MANAGEMENT</div>
      <h1 class="page-title">菜单管理</h1>
      <p class="page-desc">维护菜单层级、路由能力与权限标识，统一后台导航入口。</p>
    </div>

    <div class="filter-bar">
      <div class="filter-field">
        <label class="filter-label">菜单名称：</label>
        <Input
          v-model="queryParams['filter[title]']"
          class="filter-input"
          placeholder="请输入菜单名称"
          allow-clear
          @keyup.enter="handleQuery"
        />
      </div>
      <Button type="primary" size="small" @click="handleQuery">
        <SystemIco name="search" :size="13" />
        查询
      </Button>
      <Button type="default" size="small" @click="handleResetQuery">重置</Button>
    </div>

    <div class="list-card">
      <div class="list-head">
        <div>
          <div class="list-title">菜单列表</div>
          <div class="list-sub">支持层级查看、展开收起和菜单结构维护。</div>
        </div>
      </div>

      <div class="toolbar">
        <Button v-hasPerm="['sys:menu:addz']" type="primary" size="small" @click="openDialog(0)">
          <SystemIco name="plus" :size="13" />
          添加
        </Button>
        <Button type="default" size="small" @click="expandAll">
          <SystemIco name="expand" :size="13" />
          展开全部
        </Button>
        <Button type="default" size="small" @click="collapseAll">
          <SystemIco name="collapse" :size="13" />
          折叠全部
        </Button>
        <div class="toolbar-spacer" />
        <div class="tool-group">
          <Button class="btn-icon" type="default" size="small" title="刷新" @click="fetchData">
            <SystemIco name="refresh" :size="14" />
          </Button>
          <Button class="btn-icon" type="default" size="small" title="全屏">
            <SystemIco name="full" :size="14" />
          </Button>
        </div>
      </div>

      <div v-loading="loading" class="tbl-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th style="width: 60px">序</th>
              <th class="tbl-name-cell">菜单名称</th>
              <th style="width: 100px">菜单类型</th>
              <th>路由地址</th>
              <th>组件路径</th>
              <th>权限标识</th>
              <th style="width: 110px">排序</th>
              <th style="width: 80px">状态</th>
              <th style="width: 220px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in flatRows" :key="row.id">
              <td class="cell-num">{{ index + 1 }}</td>
              <td class="tbl-name-cell">
                <span class="tree-indent" :style="{ paddingLeft: row.depth * 20 + 'px' }">
                  <button
                    v-if="row.hasChildren"
                    class="tree-caret"
                    :class="{ open: isOpen(row.id) }"
                    type="button"
                    @click="toggle(row.id)"
                  >
                    <SystemIco name="chevRight" :size="11" />
                  </button>
                  <span v-else class="tree-caret-spacer" />
                  <span class="tree-name">
                    <span v-if="row.type === 0" class="tree-name-ico">
                      <AnimalMenuIcon
                        v-if="resolveMenuIconName(row.icon, row.path)"
                        :name="resolveMenuIconName(row.icon, row.path)!"
                        :size="18"
                      />
                      <Icon v-else :name="resolveAnimalIcon(row.icon, row.path)" :size="18" />
                    </span>
                    {{ row.title }}
                  </span>
                </span>
              </td>
              <td>
                <AnimalTag :type="row.type === 0 ? 'primary' : 'default'">
                  {{ row.type === 0 ? "菜单" : "按钮" }}
                </AnimalTag>
              </td>
              <td class="cell-mono">{{ row.path || "" }}</td>
              <td class="cell-mono">{{ row.component || "" }}</td>
              <td class="cell-mono">{{ row.permission || "" }}</td>
              <td class="cell-num">{{ row.sort }}</td>
              <td>
                <Switch
                  v-hasPerm="'sys:menu:edit'"
                  :model-value="row.status === 1"
                  size="small"
                  :loading="statusLoadingId === row.id"
                  @update:model-value="(val: boolean) => handleStatusToggle(row, val)"
                />
              </td>
              <td>
                <span class="tbl-actions">
                  <span
                    v-if="row.type === 0"
                    v-hasPerm="['sys:menu:addz']"
                    class="action-link act-add"
                    @click="openDialog(row.id)"
                  >
                    <SystemIco name="plus" :size="11" />
                    添加
                  </span>
                  <span
                    v-hasPerm="['sys:menu:edit']"
                    class="action-link act-edit"
                    @click="openDialog(undefined, row.id)"
                  >
                    <SystemIco name="edit" :size="11" />
                    修改
                  </span>
                  <span
                    v-hasPerm="['sys:menu:delete']"
                    class="action-link act-del"
                    @click="handleDelete(row.id)"
                  >
                    <SystemIco name="trash" :size="11" />
                    删除
                  </span>
                </span>
              </td>
            </tr>
            <tr v-if="!loading && flatRows.length === 0" class="empty-row">
              <td colspan="9">暂无数据</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <MenuEdit
      v-model:visible="editVisible"
      :parent-id="editingParentId"
      :menu-id="editingMenuId"
      @done="fetchData"
    />
  </div>
</template>

<script setup lang="ts">
import { confirm, message } from "@/utils/feedback";
import { computed, onMounted, reactive, ref } from "vue";

import { Button, Input, Switch } from "animal-island-vue";
import Icon from "@/components/AnimalIcon/index.vue";
import AnimalMenuIcon from "@/components/AnimalMenuIcon/index.vue";
import MenuAPI from "@/api/system/menu";
import { resolveAnimalIcon } from "@/utils/menuAnimalIcon";
import { resolveMenuIconName } from "@/utils/menuSemanticIcon";
import type { MenuItem, MenuQueryParams } from "@/types/api";
import MenuEdit from "./menu-edit.vue";
import SystemIco from "@/components/AdminPage/SystemIco.vue";
import AnimalTag from "@/components/AnimalTag/index.vue";

defineOptions({
  name: "SysMenu",
  inheritAttrs: false,
});

interface FlatRow extends MenuItem {
  depth: number;
  hasChildren: boolean;
}

const queryParams = reactive<MenuQueryParams>({});
const menuTableData = ref<MenuItem[]>([]);
const loading = ref(false);
const openMap = ref<Record<number, boolean>>({});
const editVisible = ref(false);
const editingParentId = ref<number>();
const editingMenuId = ref<number>();
const statusLoadingId = ref<number | null>(null);

const flatRows = computed<FlatRow[]>(() => {
  const rows: FlatRow[] = [];
  collectFlat(menuTableData.value, 0, rows);
  return rows;
});

function collectFlat(nodes: MenuItem[], depth: number, rows: FlatRow[]): void {
  for (const node of nodes) {
    const children = node.children?.length ? node.children : null;
    rows.push({ ...node, depth, hasChildren: !!children });
    if (children && openMap.value[node.id!]) {
      collectFlat(children, depth + 1, rows);
    }
  }
}

function collectParentIds(nodes: MenuItem[], ids: number[]): number[] {
  for (const node of nodes) {
    if (node.children?.length) {
      ids.push(node.id!);
      collectParentIds(node.children, ids);
    }
  }
  return ids;
}

function isOpen(id?: number): boolean {
  return id != null && !!openMap.value[id];
}

function toggle(id?: number): void {
  if (id == null) return;
  openMap.value = { ...openMap.value, [id]: !openMap.value[id] };
}

function expandAll(): void {
  const ids = collectParentIds(menuTableData.value, []);
  openMap.value = Object.fromEntries(ids.map((id) => [id, true]));
}

function collapseAll(): void {
  openMap.value = {};
}

function fetchData(): void {
  loading.value = true;
  MenuAPI.getList(queryParams)
    .then((data) => {
      menuTableData.value = data;
      expandAll();
    })
    .finally(() => {
      loading.value = false;
    });
}

function handleQuery(): void {
  fetchData();
}

function handleResetQuery(): void {
  queryParams["filter[title]"] = undefined;
  fetchData();
}

async function handleStatusToggle(row: FlatRow, val: boolean): Promise<void> {
  const nextStatus = val ? 1 : 2;
  statusLoadingId.value = row.id ?? null;
  try {
    await MenuAPI.updateStatus(row.id!, nextStatus);
    message.success(val ? "已激活" : "已禁用");
    fetchData();
  } finally {
    statusLoadingId.value = null;
  }
}

function openDialog(parentId?: number, menuId?: number): void {
  editingParentId.value = parentId;
  editingMenuId.value = menuId;
  editVisible.value = true;
}

function handleDelete(menuId?: number): void {
  if (!menuId) {
    message.warning("请勾选删除项");
    return;
  }

  confirm("确认删除已选中的数据项?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => {
      loading.value = true;
      MenuAPI.deleteById(menuId)
        .then(() => {
          message.success("删除成功");
          fetchData();
        })
        .finally(() => {
          loading.value = false;
        });
    },
    () => {
      message.info("已取消删除");
    }
  );
}

onMounted(() => {
  fetchData();
});
</script>
