<template>
  <div class="develop-page admin-workspace-page">
    <el-card shadow="never" class="develop-shell admin-workspace-shell">
      <!-- Hero 区域 -->
      <div class="develop-hero">
        <div class="develop-hero__copy">
          <div class="develop-hero__eyebrow">WALLPAPER CLASSIFY</div>
          <h1 class="develop-hero__title">壁纸分类</h1>
          <p class="develop-hero__desc">管理小程序壁纸分类目录</p>
        </div>
      </div>

      <!-- 搜索面板 -->
      <div class="develop-panel">
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="develop-form">
          <el-form-item label="分类名称" prop="name">
            <el-input
              v-model="queryParams.name"
              placeholder="请输入分类名称"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item class="search-buttons">
            <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
            <el-button icon="refresh" @click="handleResetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格区域 -->
      <div class="develop-table-shell">
        <div class="develop-table-shell__header">
          <div>
            <div class="develop-table-shell__title">分类列表</div>
            <div class="develop-table-shell__desc">定义壁纸分类及其展示顺序和封面。</div>
          </div>
          <div class="develop-table-shell__actions">
            <el-button type="success" icon="plus" @click="handleCreateClick">新增分类</el-button>
            <el-button
              type="danger"
              icon="delete"
              :disabled="!hasSelection"
              @click="handleDelete()"
            >
              批量删除
            </el-button>
          </div>
        </div>

        <el-table
          v-loading="loading"
          :data="dataList"
          border
          stripe
          class="develop-table"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="ID" prop="id" width="80" align="center" />
          <el-table-column label="分类名称" prop="name" min-width="140" />
          <el-table-column label="封面图" width="100" align="center">
            <template #default="{ row }">
              <el-image
                v-if="row.picUrl"
                :src="row.picUrl"
                style="width: 60px; height: 60px; border-radius: 6px"
                fit="cover"
              />
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="推荐" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.select ? 'success' : 'info'">
                {{ row.select ? "推荐" : "普通" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="排序" prop="sort" width="90" align="center" />
          <el-table-column label="创建时间" prop="createTime" width="180" align="center" />
          <el-table-column label="操作" fixed="right" width="150" align="center">
            <template #default="{ row }">
              <el-button type="primary" icon="edit" link size="small" @click="handleEditClick(row)">
                编辑
              </el-button>
              <el-button
                type="danger"
                icon="delete"
                link
                size="small"
                @click="handleDelete(row.id)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-if="total > 0"
          v-model:total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="fetchList"
        />
      </div>
    </el-card>

    <AdminAnimalModal
      v-model:visible="dialogState.visible"
      :title="dialogState.title"
      width="500px"
      @close="closeDialog"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
        class="develop-dialog-form"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入分类名称" maxlength="20" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" controls-position="right" />
        </el-form-item>
        <el-form-item label="封面图URL" prop="picUrl">
          <el-input v-model="formData.picUrl" placeholder="请输入封面图URL" />
        </el-form-item>
        <el-form-item label="是否推荐" prop="select">
          <el-switch v-model="formData.select" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="develop-dialog-footer">
          <Button type="primary" @click="handleSubmit">确定</Button>
          <Button type="default" @click="closeDialog">取消</Button>
        </div>
      </template>
    </AdminAnimalModal>
  </div>
</template>

<script setup lang="ts">
import { confirm, message } from "@/utils/feedback";
import type { FormInstance, FormRules } from "element-plus";
import { Button } from "animal-island-vue";
import AdminAnimalModal from "@/components/AdminPage/AdminAnimalModal.vue";
import WallpaperClassifyAPI from "@/api/mini-program/wallpaper-classify";
import type {
  WallpaperClassifyItem,
  WallpaperClassifyQueryParams,
  WallpaperClassifyForm,
} from "@/types/api/wallpaper-classify";
import { useTableSelection } from "@/composables";

defineOptions({ name: "WallpaperClassify" });

const queryFormRef = ref<FormInstance>();
const formRef = ref<FormInstance>();

const queryParams = reactive<WallpaperClassifyQueryParams>({
  pageNum: 1,
  pageSize: 10,
  name: "",
});

const loading = ref(false);
const total = ref(0);
const dataList = ref<WallpaperClassifyItem[]>([]);

const { selectedIds, hasSelection, handleSelectionChange } =
  useTableSelection<WallpaperClassifyItem>();

const dialogState = reactive({
  visible: false,
  title: "",
});

const initialFormData: WallpaperClassifyForm = {
  name: "",
  sort: 0,
  picUrl: "",
  select: false,
};

const formData = reactive<WallpaperClassifyForm>({ ...initialFormData });

const rules: FormRules = {
  name: [
    { required: true, message: "请输入分类名称", trigger: "blur" },
    { max: 20, message: "分类名称不能超过20个字符", trigger: "blur" },
  ],
  sort: [{ required: true, message: "请输入排序", trigger: "change" }],
};

async function fetchList() {
  loading.value = true;
  try {
    const data = await WallpaperClassifyAPI.getPage(queryParams);
    dataList.value = data.list;
    total.value = data.total;
  } finally {
    loading.value = false;
  }
}

function handleQuery() {
  queryParams.pageNum = 1;
  fetchList();
}

function handleResetQuery() {
  queryFormRef.value?.resetFields();
  handleQuery();
}

function handleCreateClick() {
  dialogState.title = "新增壁纸分类";
  Object.assign(formData, initialFormData);
  dialogState.visible = true;
}

function handleEditClick(row: WallpaperClassifyItem) {
  dialogState.title = "编辑壁纸分类";
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    sort: row.sort,
    picUrl: row.picUrl || "",
    select: row.select,
  });
  dialogState.visible = true;
}

function closeDialog() {
  dialogState.visible = false;
  formRef.value?.resetFields();
}

async function handleSubmit() {
  await formRef.value?.validate();
  loading.value = true;
  try {
    if (formData.id) {
      await WallpaperClassifyAPI.update(formData.id, formData);
      message.success("修改成功");
    } else {
      await WallpaperClassifyAPI.create(formData);
      message.success("新增成功");
    }
    closeDialog();
    fetchList();
  } finally {
    loading.value = false;
  }
}

function normalizeIds(id?: number) {
  if (id) return [id];
  return selectedIds.value.map((item) => Number(item)).filter((item) => Number.isFinite(item));
}

async function handleDelete(id?: number) {
  const ids = normalizeIds(id);
  if (!ids.length) {
    message.warning("请勾选删除项");
    return;
  }
  try {
    await confirm("确认删除选中的项吗？", "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch {
    return;
  }

  loading.value = true;
  try {
    await Promise.all(ids.map((item) => WallpaperClassifyAPI.deleteById(item)));
    message.success("删除成功");
    fetchList();
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchList();
});
</script>
