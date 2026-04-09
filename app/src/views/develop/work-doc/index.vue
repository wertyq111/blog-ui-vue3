<template>
  <div class="app-container" style="display: flex; gap: 16px">
    <!-- 左侧分类树 -->
    <el-card style="width: 280px; flex-shrink: 0" shadow="hover" class="category-card">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-bold">文档分类</span>
          <el-button type="primary" icon="plus" circle size="small" @click="handleCreateCategory" />
        </div>
      </template>

      <!-- 根节点放置区 -->
      <div 
        class="root-drop-zone mb-2 p-2 border-2 border-dashed border-gray-200 rounded text-center text-xs text-gray-400 transition-colors"
        :class="{ 'border-blue-400 bg-blue-50 text-blue-500': rootDragOver }"
        @dragover.prevent="rootDragOver = true"
        @dragleave="rootDragOver = false"
        @drop="handleRootDrop"
      >
        拖拽到此处设为根分类
      </div>

      <el-tree
        ref="treeRef"
        :data="categoryTree"
        :props="{ children: 'children', label: 'name' }"
        node-key="id"
        highlight-current
        default-expand-all
        draggable
        :allow-drop="allowDrop"
        @node-click="handleCategoryClick"
        @node-drop="handleCategoryDrop"
      >
        <template #default="{ node, data }">
          <div class="flex items-center justify-between w-full pr-2 group">
            <div class="flex items-center">
              <el-icon class="mr-1 text-gray-400">
                <Folder v-if="data.children?.length" />
                <Document v-else />
              </el-icon>
              <span>{{ node.label }}</span>
            </div>
            <span class="hidden group-hover:flex items-center gap-1">
              <el-icon class="text-blue-500 cursor-pointer" @click.stop="handleEditCategory(data)">
                <Edit />
              </el-icon>
              <el-icon class="text-danger cursor-pointer" @click.stop="handleDeleteCategory(data.id)">
                <Delete />
              </el-icon>
            </span>
          </div>
        </template>
      </el-tree>
      <div
        class="mt-4 text-center cursor-pointer text-gray-400 hover:text-blue-500"
        @click="handleCategoryClick({ id: undefined })"
      >
        显示全部
      </div>
    </el-card>

    <!-- 右侧文档列表 -->
    <div style="flex: 1; min-width: 0">
      <div class="filter-section">
        <el-form ref="queryFormRef" :model="queryParams" :inline="true">
          <el-form-item label="关键字" prop="keyword">
            <el-input
              v-model="queryParams.keyword"
              placeholder="标题/内容"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
              <el-option label="启用" :value="1" />
              <el-option label="停用" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item label="模板" prop="templateType">
            <el-select
              v-model="queryParams.templateType"
              placeholder="全部"
              clearable
              style="width: 150px"
            >
              <el-option label="自定义" value="custom" />
              <el-option label="故障排查" value="troubleshooting" />
              <el-option label="方案设计" value="design" />
              <el-option label="知识点" value="knowledge" />
            </el-select>
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
            <el-button type="success" icon="plus" @click="handleCreateClick">新增文档</el-button>
          </div>
        </div>

        <el-table v-loading="loading" :data="dataList" border stripe class="table-section__content">
          <el-table-column label="标题" min-width="260" show-overflow-tooltip>
            <template #default="{ row }">
              <el-tag v-if="row.isPin === 1" size="small" type="danger" class="mr-1">置顶</el-tag>
              <el-link type="primary" class="font-medium" @click="handlePreview(row)">{{ row.title }}</el-link>
            </template>
          </el-table-column>
          <el-table-column label="分类" min-width="120">
            <template #default="{ row }">{{ row.category?.name || "-" }}</template>
          </el-table-column>
          <el-table-column label="标签" min-width="160">
            <template #default="{ row }">
              <el-space v-if="row.tags?.length" wrap>
                <el-tag v-for="tag in row.tags" :key="tag" size="small" type="info">{{ tag }}</el-tag>
              </el-space>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="优先级" prop="priority" width="90" align="center">
            <template #default="{ row }">
              <el-tag :type="row.priority >= 8 ? 'danger' : row.priority >= 5 ? 'warning' : 'info'">
                {{ row.priority }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="90" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'info'">
                {{ row.status === 1 ? "启用" : "停用" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="更新时间" prop="updateTime" width="180" align="center" />
          <el-table-column label="操作" fixed="right" width="200" align="center">
            <template #default="{ row }">
              <el-button type="primary" icon="edit" link size="small" @click="handleEditClick(row)">
                编辑
              </el-button>
              <el-button type="success" icon="share" link size="small" @click="copyMarkdownLink(row)">
                链接
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
    </div>

    <!-- 分类编辑弹窗 -->
    <el-dialog
      v-model="categoryDialog.visible"
      :title="categoryDialog.title"
      width="500px"
      @close="closeCategoryDialog"
    >
      <el-form ref="categoryFormRef" :model="categoryFormData" :rules="categoryRules" label-width="100px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryFormData.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="父分类" prop="parentId">
          <el-select v-model="categoryFormData.parentId" placeholder="无" clearable style="width: 100%">
            <el-option v-for="item in flattenedCategories" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="categoryFormData.icon" placeholder="请输入图标名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="categoryFormData.description" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="categoryFormData.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="categoryFormData.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleCategorySubmit">确 定</el-button>
          <el-button @click="closeCategoryDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 文档编辑弹窗 -->
    <el-dialog v-model="dialogState.visible" :title="dialogState.title" width="1000px" @close="closeDialog">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="16">
            <el-form-item label="标题" prop="title">
              <el-input v-model="formData.title" placeholder="请输入标题" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="分类" prop="categoryId">
              <el-select v-model="formData.categoryId" placeholder="请选择分类" style="width: 100%">
                <el-option v-for="item in flattenedCategories" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="模板类型" prop="templateType">
              <el-select v-model="formData.templateType" style="width: 100%">
                <el-option label="自定义" value="custom" />
                <el-option label="故障排查" value="troubleshooting" />
                <el-option label="方案设计" value="design" />
                <el-option label="知识点" value="knowledge" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态" prop="status">
              <el-select v-model="formData.status" style="width: 100%">
                <el-option label="启用" :value="1" />
                <el-option label="停用" :value="0" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="优先级" prop="priority">
              <el-input-number v-model="formData.priority" :min="0" :max="10" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="标签" prop="tagString">
              <el-input v-model="formData.tagString" placeholder="英文逗号分隔" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="项目来源" prop="source">
              <el-select v-model="formData.source" filterable clearable style="width: 100%">
                <el-option v-for="item in platforms" :key="item.id" :label="item.name" :value="item.name" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="置顶" prop="isPin">
              <el-switch v-model="formData.isPin" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="内容" prop="content">
          <MdEditor v-model="formData.content" height="500px" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 文档预览弹窗 -->
    <el-dialog v-model="previewState.visible" :title="previewState.title" width="80%" fullscreen>
      <MdEditor :model-value="previewState.content" preview-only height="calc(100vh - 120px)" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { Edit, Delete, Folder, Document } from "@element-plus/icons-vue";
import WorkDocAPI from "@/api/develop/work-doc";
import WorkDocCategoryAPI from "@/api/develop/work-doc-category";
import WorkPlatformAPI from "@/api/develop/work-platform";
import type { WorkDocQueryParams, WorkDocItem, WorkDocForm } from "@/types/api/work-doc";
import type { WorkDocCategoryItem, WorkDocCategoryForm } from "@/types/api/work-doc-category";
import type { WorkPlatformItem } from "@/types/api/work-platform";
import MdEditor from "@/components/MdEditor/index.vue";

defineOptions({ name: "WorkDoc" });

const queryFormRef = ref<FormInstance>();
const formRef = ref<FormInstance>();
const categoryFormRef = ref<FormInstance>();
const treeRef = ref();

const queryParams = reactive<WorkDocQueryParams>({
  pageNum: 1,
  pageSize: 10,
  keyword: "",
  categoryId: undefined,
  status: undefined,
  templateType: undefined,
});

const loading = ref(false);
const total = ref(0);
const dataList = ref<WorkDocItem[]>([]);
const categoryTree = ref<WorkDocCategoryItem[]>([]);
const platforms = ref<WorkPlatformItem[]>([]);

const rootDragOver = ref(false);

const dialogState = reactive({
  visible: false,
  title: "",
});

const categoryDialog = reactive({
  visible: false,
  title: "",
});

const previewState = reactive({
  visible: false,
  title: "",
  content: "",
});

const initialFormData = {
  id: undefined as number | undefined,
  categoryId: undefined as unknown as number,
  title: "",
  content: "",
  templateType: "custom",
  tagString: "",
  status: 1,
  priority: 0,
  source: "",
  isPin: 0,
};

const formData = reactive({ ...initialFormData });

const initialCategoryData: WorkDocCategoryForm = {
  name: "",
  parentId: undefined,
  icon: "",
  description: "",
  sort: 0,
  status: 1,
};

const categoryFormData = reactive<WorkDocCategoryForm>({ ...initialCategoryData });

const flattenedCategories = computed(() => {
  const result: any[] = [];
  const traverse = (list: WorkDocCategoryItem[]) => {
    list.forEach(item => {
      result.push({ id: item.id, name: item.name });
      if (item.children?.length) {
        traverse(item.children);
      }
    });
  };
  traverse(categoryTree.value);
  return result;
});

const rules: FormRules = {
  title: [{ required: true, message: "请输入标题", trigger: "blur" }],
  categoryId: [{ required: true, message: "请选择分类", trigger: "change" }],
  content: [{ required: true, message: "请输入内容", trigger: "blur" }],
};

const categoryRules: FormRules = {
  name: [{ required: true, message: "请输入分类名称", trigger: "blur" }],
};

async function fetchCategories() {
  categoryTree.value = await WorkDocCategoryAPI.getList();
}

async function fetchPlatforms() {
  platforms.value = await WorkPlatformAPI.getList(1);
}

async function fetchList() {
  loading.value = true;
  try {
    const data = await WorkDocAPI.getPage(queryParams);
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

function handleCategoryClick(data: any) {
  queryParams.categoryId = data.id;
  handleQuery();
}

function allowDrop(draggingNode: any, dropNode: any, type: string) {
  return true;
}

function flattenTree(nodes: any[], parentId: number | null = null): any[] {
  const result: any[] = [];
  nodes.forEach((node, index) => {
    result.push({ id: node.id, parentId, sort: index });
    if (node.children?.length) {
      result.push(...flattenTree(node.children, node.id));
    }
  });
  return result;
}

async function handleCategoryDrop() {
  const flatList = flattenTree(categoryTree.value);
  loading.value = true;
  try {
    await WorkDocCategoryAPI.reorder(flatList);
    ElMessage.success('排序已保存');
    fetchCategories();
  } finally {
    loading.value = false;
  }
}

async function handleRootDrop() {
  rootDragOver.value = false;
  // logic handled by whole tree reorder in handleCategoryDrop
}

function handlePreview(row: WorkDocItem) {
  previewState.title = row.title;
  previewState.content = row.content;
  previewState.visible = true;
}

function copyMarkdownLink(row: WorkDocItem) {
  const link = `[${row.title}](/develop/work-doc?id=${row.id})`;
  navigator.clipboard.writeText(link).then(() => {
    ElMessage.success('Markdown 链接已复制');
  });
}

// 文档 CRUD
function handleCreateClick() {
  dialogState.title = "新增工作文档";
  Object.assign(formData, initialFormData, { 
    categoryId: queryParams.categoryId || undefined,
    tagString: "" 
  });
  dialogState.visible = true;
}

async function handleEditClick(row: WorkDocItem) {
  dialogState.title = "编辑工作文档";
  loading.value = true;
  try {
    const info = await WorkDocAPI.getInfo(row.id);
    Object.assign(formData, {
      id: info.id,
      categoryId: info.categoryId,
      title: info.title,
      content: info.content,
      templateType: info.templateType || "custom",
      tagString: info.tags?.join(",") || "",
      status: info.status ?? 1,
      priority: info.priority ?? 0,
      source: info.source || "",
      isPin: info.isPin ?? 0,
    });
    dialogState.visible = true;
  } finally {
    loading.value = false;
  }
}

function closeDialog() {
  dialogState.visible = false;
  formRef.value?.resetFields();
}

async function handleSubmit() {
  await formRef.value?.validate();
  loading.value = true;
  
  const tags = formData.tagString ? formData.tagString.split(",").map(t => t.trim()).filter(t => t) : [];
  const { tagString, ...submitData } = formData;
  (submitData as any).tags = tags;

  try {
    if (submitData.id) {
      await WorkDocAPI.update(submitData.id, submitData as any);
      ElMessage.success("修改成功");
    } else {
      await WorkDocAPI.create(submitData as any);
      ElMessage.success("新增成功");
    }
    closeDialog();
    fetchList();
  } finally {
    loading.value = false;
  }
}

async function handleDelete(id: number) {
  try {
    await ElMessageBox.confirm("确认删除该文档吗？", "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch {
    return;
  }
  loading.value = true;
  try {
    await WorkDocAPI.deleteById(id);
    ElMessage.success("删除成功");
    fetchList();
  } finally {
    loading.value = false;
  }
}

// 分类 CRUD
function handleCreateCategory() {
  categoryDialog.title = "新增分类";
  Object.assign(categoryFormData, initialCategoryData, { parentId: queryParams.categoryId });
  categoryDialog.visible = true;
}

function handleEditCategory(data: WorkDocCategoryItem) {
  categoryDialog.title = "编辑分类";
  Object.assign(categoryFormData, {
    id: data.id,
    name: data.name,
    parentId: data.parentId || undefined,
    icon: data.icon,
    description: data.description,
    sort: data.sort,
    status: data.status,
  });
  categoryDialog.visible = true;
}

function closeCategoryDialog() {
  categoryDialog.visible = false;
  categoryFormRef.value?.resetFields();
}

async function handleCategorySubmit() {
  await categoryFormRef.value?.validate();
  loading.value = true;
  try {
    if (categoryFormData.id) {
      await WorkDocCategoryAPI.update(categoryFormData.id, categoryFormData);
      ElMessage.success("修改成功");
    } else {
      await WorkDocCategoryAPI.create(categoryFormData);
      ElMessage.success("新增成功");
    }
    closeCategoryDialog();
    fetchCategories();
  } finally {
    loading.value = false;
  }
}

async function handleDeleteCategory(id: number) {
  try {
    await ElMessageBox.confirm("确认删除该分类吗？如果分类下有文档或子分类将无法删除。", "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch {
    return;
  }
  loading.value = true;
  try {
    await WorkDocCategoryAPI.deleteById(id);
    ElMessage.success("删除成功");
    fetchCategories();
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await fetchCategories();
  await fetchPlatforms();
  fetchList();
});
</script>

<style scoped>
.app-container {
  height: calc(100vh - 84px);
}
.category-card {
  display: flex;
  flex-direction: column;
}
.table-section {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.root-drop-zone.drag-over {
  border-color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}
</style>
