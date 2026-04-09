<template>
  <div class="app-container">
    <div class="filter-section">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="标签名称" prop="name">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入标签名称"
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

    <el-card shadow="hover" class="table-section">
      <div class="table-section__toolbar">
        <div class="table-section__toolbar--actions">
          <el-button type="success" icon="plus" @click="handleCreateClick">新增</el-button>
          <el-button type="danger" icon="delete" :disabled="!hasSelection" @click="handleDelete()">
            删除
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="dataList"
        border
        stripe
        class="table-section__content"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column label="ID" prop="id" width="80" align="center" />
        <el-table-column label="所属分类" min-width="140">
          <template #default="{ row }">
            {{ row.category?.name || "-" }}
          </template>
        </el-table-column>
        <el-table-column label="标签名称" prop="name" min-width="140" />
        <el-table-column label="描述" prop="description" min-width="220" show-overflow-tooltip />
        <el-table-column label="创建时间" prop="createTime" width="180" align="center" />
        <el-table-column label="操作" fixed="right" width="150" align="center">
          <template #default="{ row }">
            <el-button type="primary" icon="edit" link size="small" @click="handleEditClick(row)">
              编辑
            </el-button>
            <el-button type="danger" icon="delete" link size="small" @click="handleDelete(row.id)">
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
    </el-card>

    <el-dialog v-model="dialogState.visible" :title="dialogState.title" width="600px" @close="closeDialog">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="所属分类" prop="categoryId">
          <el-select v-model="formData.categoryId" placeholder="请选择分类" style="width: 100%">
            <el-option v-for="item in categoryList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入标签名称" maxlength="20" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus";
import LabelAPI from "@/api/mini-program/label";
import type { CategoryItem } from "@/types/api/category";
import type { LabelQueryParams, LabelItem, LabelForm } from "@/types/api/label";
import { useTableSelection } from "@/composables";

defineOptions({ name: "NotebookLabel" });

const queryFormRef = ref<FormInstance>();
const formRef = ref<FormInstance>();

const queryParams = reactive<LabelQueryParams>({
  pageNum: 1,
  pageSize: 10,
  name: "",
});

const loading = ref(false);
const total = ref(0);
const dataList = ref<LabelItem[]>([]);
const categoryList = ref<CategoryItem[]>([]);

const { selectedIds, hasSelection, handleSelectionChange } = useTableSelection<LabelItem>();

const dialogState = reactive({
  visible: false,
  title: "",
});

const initialFormData: LabelForm = {
  categoryId: undefined as unknown as number,
  name: "",
  description: "",
};

const formData = reactive<LabelForm>({ ...initialFormData });

const rules: FormRules = {
  categoryId: [{ required: true, message: "请选择分类", trigger: "change" }],
  name: [
    { required: true, message: "请输入标签名称", trigger: "blur" },
    { max: 20, message: "标签名称不能超过20个字符", trigger: "blur" },
  ],
};

async function fetchCategoryList() {
  categoryList.value = await LabelAPI.getCategoryList();
}

async function fetchList() {
  loading.value = true;
  try {
    const data = await LabelAPI.getPage(queryParams);
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
  dialogState.title = "新增笔记标签";
  Object.assign(formData, initialFormData);
  dialogState.visible = true;
}

function handleEditClick(row: LabelItem) {
  dialogState.title = "编辑笔记标签";
  Object.assign(formData, {
    id: row.id,
    categoryId: row.categoryId,
    name: row.name,
    description: row.description || "",
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
      await LabelAPI.update(formData.id, formData);
      ElMessage.success("修改成功");
    } else {
      await LabelAPI.create(formData);
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
    await Promise.all(ids.map((item) => LabelAPI.deleteById(item)));
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

