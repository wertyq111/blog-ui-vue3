<template>
  <div class="develop-page admin-workspace-page">
    <el-card shadow="never" class="develop-shell admin-workspace-shell">
      <section class="develop-hero">
        <div class="develop-hero__copy">
          <div class="develop-hero__eyebrow">Develop Workspace</div>
          <div class="develop-hero__title">模型初始化</div>
          <div class="develop-hero__desc">管理框架模板，快捷生成模型初始化代码。</div>
        </div>
      </section>

      <section class="develop-panel develop-panel--filter">
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="develop-form">
          <el-form-item label="框架编码" prop="code">
            <el-input
              v-model="queryParams.code"
              placeholder="请输入框架编码"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="框架名称" prop="name">
            <el-input
              v-model="queryParams.name"
              placeholder="请输入框架名称"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item class="search-buttons">
            <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
            <el-button icon="refresh" @click="handleResetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </section>

      <section class="develop-table-shell">
        <div class="develop-table-shell__header">
          <div>
            <div class="develop-table-shell__title">框架模板列表</div>
            <div class="develop-table-shell__desc">定义不同技术栈的 Model/Entity 模板及其转换规则。</div>
          </div>
          <div class="develop-table-shell__actions">
            <el-button type="success" icon="plus" @click="handleCreateClick">新增模板</el-button>
            <el-button type="danger" icon="delete" :disabled="!hasSelection" @click="handleBatchDelete">
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
          <el-table-column label="框架编码" prop="code" width="120" />
          <el-table-column label="框架名称" prop="name" width="150" />
          <el-table-column label="参考格式" prop="tip" min-width="200" show-overflow-tooltip />
          <el-table-column label="创建时间" prop="createTime" width="180" align="center" />
          <el-table-column label="更新时间" prop="updateTime" width="180" align="center" />
          <el-table-column label="操作" fixed="right" width="200" align="center">
            <template #default="{ row }">
              <el-button type="success" icon="refresh" link size="small" @click="handleConvertClick(row)">
                转换
              </el-button>
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
      </section>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogState.visible"
      :title="dialogState.title"
      width="650px"
      class="develop-dialog"
      @close="closeDialog"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="110px" class="develop-dialog-form">
        <el-form-item label="框架编码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入框架编码" maxlength="20" />
        </el-form-item>
        <el-form-item label="框架名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入框架名称" maxlength="20" />
        </el-form-item>
        <el-form-item label="模板提示" prop="tip">
          <el-input v-model="formData.tip" placeholder="请输入模板提示" maxlength="200" />
        </el-form-item>
        <el-form-item label="模型模板" prop="template">
          <el-input
            v-model="formData.template"
            type="textarea"
            :rows="8"
            placeholder="请输入模型模板内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="develop-dialog-footer">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 转换弹窗 -->
    <el-dialog
      v-model="convertState.visible"
      title="模型初始化转换"
      width="700px"
      class="develop-dialog"
    >
      <el-form label-position="top" class="develop-dialog-form">
        <el-form-item label="列 definition (每行一个)">
          <el-input
            v-model="convertState.columnsText"
            type="textarea"
            :rows="8"
            placeholder="请输入列定义内容"
          />
        </el-form-item>
        <el-form-item v-if="convertState.result" label="生成结果">
          <el-input v-model="convertState.result" type="textarea" :rows="12" readonly />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="develop-dialog-footer">
          <el-button type="primary" :loading="convertState.loading" @click="handleDoConvert">
            生 成
          </el-button>
          <el-button @click="convertState.visible = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus";
import InitModelAPI from "@/api/develop/init-model";
import type { InitModelQueryParams, InitModelItem, InitModelForm } from "@/types/api/init-model";
import { useTableSelection } from "@/composables";

defineOptions({ name: "InitModel" });

const queryFormRef = ref<FormInstance>();
const formRef = ref<FormInstance>();

const queryParams = reactive<InitModelQueryParams>({
  pageNum: 1,
  pageSize: 10,
  code: "",
  name: "",
});

const loading = ref(false);
const total = ref(0);
const dataList = ref<InitModelItem[]>([]);

const { selectedIds, hasSelection, handleSelectionChange } = useTableSelection<InitModelItem>();

const dialogState = reactive({
  visible: false,
  title: "",
});

const convertState = reactive({
  visible: false,
  id: 0,
  columnsText: "",
  result: "",
  loading: false,
});

const initialFormData: InitModelForm = {
  code: "",
  name: "",
  template: "",
  tip: "",
};

const formData = reactive<InitModelForm>({ ...initialFormData });

const rules: FormRules = {
  code: [{ required: true, message: "请输入框架编码", trigger: "blur" }],
  name: [{ required: true, message: "请输入框架名称", trigger: "blur" }],
  tip: [{ required: true, message: "请输入模板提示", trigger: "blur" }],
  template: [{ required: true, message: "请输入模型模板", trigger: "blur" }],
};

async function fetchList() {
  loading.value = true;
  try {
    const data = await InitModelAPI.getPage(queryParams);
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
  dialogState.title = "新增模型初始化";
  Object.assign(formData, initialFormData);
  dialogState.visible = true;
}

function handleEditClick(row: InitModelItem) {
  dialogState.title = "编辑模型初始化";
  Object.assign(formData, {
    id: row.id,
    code: row.code,
    name: row.name,
    template: row.template,
    tip: row.tip,
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
      await InitModelAPI.update(formData.id, formData);
      ElMessage.success("修改成功");
    } else {
      await InitModelAPI.create(formData);
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
    await ElMessageBox.confirm("确认删除该项吗？", "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch {
    return;
  }

  loading.value = true;
  try {
    await InitModelAPI.deleteById(id);
    ElMessage.success("删除成功");
    fetchList();
  } finally {
    loading.value = false;
  }
}

async function handleBatchDelete() {
  const ids = selectedIds.value.map(id => Number(id));
  try {
    await ElMessageBox.confirm(`确认删除选中的 ${ids.length} 项吗？`, "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch {
    return;
  }

  loading.value = true;
  try {
    await InitModelAPI.batchDelete(ids);
    ElMessage.success("批量删除成功");
    fetchList();
  } finally {
    loading.value = false;
  }
}

function handleConvertClick(row: InitModelItem) {
  convertState.id = row.id;
  convertState.columnsText = "";
  convertState.result = "";
  convertState.visible = true;
}

async function handleDoConvert() {
  const columns = convertState.columnsText.split("\n").map(p => p.trim()).filter(p => p);
  if (!columns.length) {
    ElMessage.warning("请输入列 definition");
    return;
  }
  convertState.loading = true;
  try {
    const res = await InitModelAPI.convert(convertState.id, columns);
    convertState.result = Array.isArray(res) ? res.join("\n") : String(res);
    ElMessage.success("生成完成");
  } finally {
    convertState.loading = false;
  }
}

onMounted(() => {
  fetchList();
});
</script>
