<template>
  <div class="develop-page admin-workspace-page">
    <el-card shadow="never" class="develop-shell admin-workspace-shell">
      <!-- Hero 区域 -->
      <div class="develop-hero">
        <div class="develop-hero__copy">
          <div class="develop-hero__eyebrow">PHOTO</div>
          <h1 class="develop-hero__title">相册管理</h1>
          <p class="develop-hero__desc">管理照片资源</p>
        </div>
      </div>

      <!-- 搜索面板 -->
      <div class="develop-panel">
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="develop-form">
          <el-form-item label="相册" prop="categoryId">
            <el-select
              v-model="queryParams.categoryId"
              placeholder="请选择相册"
              clearable
              style="width: 180px"
            >
              <el-option
                v-for="item in categoryList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="描述" prop="remark">
            <el-input
              v-model="queryParams.remark"
              placeholder="请输入描述"
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
            <div class="develop-table-shell__title">照片列表</div>
            <div class="develop-table-shell__desc">管理所有相册图片，支持预览与批量操作。</div>
          </div>
          <div class="develop-table-shell__actions">
            <el-button type="success" icon="plus" @click="handleCreateClick">新增图片</el-button>
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
          <el-table-column label="缩略图" width="100" align="center">
            <template #default="{ row }">
              <el-image
                v-if="row.smallPicUrl || row.url"
                :src="row.smallPicUrl || row.url"
                :preview-src-list="row.url ? [row.url] : []"
                style="width: 60px; height: 60px; border-radius: 6px"
                fit="cover"
                preview-teleported
              />
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="相册" min-width="140">
            <template #default="{ row }">
              {{ row.category?.name || "-" }}
            </template>
          </el-table-column>
          <el-table-column label="描述" prop="remark" min-width="220" show-overflow-tooltip />
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
        <el-form-item label="相册" prop="categoryId">
          <el-select v-model="formData.categoryId" placeholder="请选择相册" style="width: 100%">
            <el-option
              v-for="item in categoryList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="原图URL" prop="url">
          <el-input v-model="formData.url" placeholder="请输入图片URL" />
        </el-form-item>
        <el-form-item label="描述" prop="remark">
          <el-input v-model="formData.remark" placeholder="请输入描述" />
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
import type { FormInstance, FormRules } from "element-plus";
import { Button } from "animal-island-vue";
import AdminAnimalModal from "@/components/AdminPage/AdminAnimalModal.vue";
import PhotoAPI from "@/api/mini-program/photo";
import type { PhotoCategoryItem } from "@/types/api/photo-category";
import type { PhotoQueryParams, PhotoItem, PhotoForm } from "@/types/api/photo";
import { useTableSelection } from "@/composables";

defineOptions({ name: "Photo" });

const queryFormRef = ref<FormInstance>();
const formRef = ref<FormInstance>();

const queryParams = reactive<PhotoQueryParams>({
  pageNum: 1,
  pageSize: 10,
  categoryId: undefined,
  remark: "",
});

const loading = ref(false);
const total = ref(0);
const dataList = ref<PhotoItem[]>([]);
const categoryList = ref<PhotoCategoryItem[]>([]);

const { selectedIds, hasSelection, handleSelectionChange } = useTableSelection<PhotoItem>();

const dialogState = reactive({
  visible: false,
  title: "",
});

const initialFormData: PhotoForm = {
  categoryId: undefined as unknown as number,
  url: "",
  smallPicUrl: "",
  remark: "",
};

const formData = reactive<PhotoForm>({ ...initialFormData });

const rules: FormRules = {
  categoryId: [{ required: true, message: "请选择相册", trigger: "change" }],
  url: [{ required: true, message: "请输入图片URL", trigger: "blur" }],
};

async function fetchCategoryList() {
  categoryList.value = await PhotoAPI.getCategoryList();
}

async function fetchList() {
  loading.value = true;
  try {
    const data = await PhotoAPI.getPage(queryParams);
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
  dialogState.title = "新增相册图片";
  Object.assign(formData, initialFormData);
  dialogState.visible = true;
}

function handleEditClick(row: PhotoItem) {
  dialogState.title = "编辑相册图片";
  Object.assign(formData, {
    id: row.id,
    categoryId: row.categoryId,
    url: row.url,
    smallPicUrl: row.smallPicUrl || "",
    remark: row.remark || "",
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
      await PhotoAPI.update(formData.id, formData);
      ElMessage.success("修改成功");
    } else {
      await PhotoAPI.create(formData);
      ElMessage.success("新增成功");
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
    ElMessage.warning("请勾选删除项");
    return;
  }
  try {
    await ElMessageBox.confirm("确认删除选中的项吗？", "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch {
    return;
  }

  loading.value = true;
  try {
    await PhotoAPI.batchDelete(ids);
    ElMessage.success("删除成功");
    fetchList();
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await fetchCategoryList();
  fetchList();
});
</script>
