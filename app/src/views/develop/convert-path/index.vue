<template>
  <div class="app-container">
    <div class="filter-section">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="项目名称" prop="name">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入项目名称"
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
        class="table-section__content"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column type="index" label="#" width="50" align="center" />
        <el-table-column label="项目编码" prop="code" width="150" />
        <el-table-column label="项目名称" prop="name" width="150" />
        <el-table-column label="网址" min-width="200">
          <template #default="{ row }">
            <el-link v-if="row.url" :href="row.url" target="_blank" type="primary">{{ row.url }}</el-link>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="服务器地址" prop="target" min-width="200" />
        <el-table-column label="排序" prop="sort" width="80" align="center" />
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
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogState.visible" :title="dialogState.title" width="600px" @close="closeDialog">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="110px">
        <el-form-item label="项目编码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入项目编码" maxlength="20" />
        </el-form-item>
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入项目名称" maxlength="20" />
        </el-form-item>
        <el-form-item label="服务器地址" prop="target">
          <el-input v-model="formData.target" placeholder="请输入服务器地址" maxlength="200" />
        </el-form-item>
        <el-form-item label="来源地址">
          <div v-for="(source, index) in formData.sources" :key="index" class="flex gap-2 mb-2">
            <el-input v-model="formData.sources[index]" placeholder="请输入来源地址" />
            <el-button
              v-if="index === formData.sources.length - 1"
              type="primary"
              icon="plus"
              circle
              @click="handleAddSource"
            />
            <el-button
              v-if="index !== 0"
              type="danger"
              icon="minus"
              circle
              @click="handleRemoveSource(index)"
            />
          </div>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 转换弹窗 -->
    <el-dialog v-model="convertState.visible" title="路径转换" width="700px">
      <el-form label-position="top">
        <el-form-item label="待转换路径 (每行一个)">
          <el-input
            v-model="convertState.pathsText"
            type="textarea"
            :rows="8"
            placeholder="请输入需要转换的本地路径"
          />
        </el-form-item>
        <el-form-item v-if="convertState.result" label="转换结果">
          <el-input v-model="convertState.result" type="textarea" :rows="8" readonly />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" :loading="convertState.loading" @click="handleDoConvert">
            转 换
          </el-button>
          <el-button @click="convertState.visible = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus";
import ServerPathAPI from "@/api/develop/server-path";
import type { ServerPathQueryParams, ServerPathItem, ServerPathForm } from "@/types/api/server-path";
import { useTableSelection } from "@/composables";

defineOptions({ name: "ConvertPath" });

const queryFormRef = ref<FormInstance>();
const formRef = ref<FormInstance>();

const queryParams = reactive<ServerPathQueryParams>({
  pageNum: 1,
  pageSize: 10,
  name: "",
});

const loading = ref(false);
const total = ref(0);
const dataList = ref<ServerPathItem[]>([]);

const { selectedIds, hasSelection, handleSelectionChange } = useTableSelection<ServerPathItem>();

const dialogState = reactive({
  visible: false,
  title: "",
});

const convertState = reactive({
  visible: false,
  id: 0,
  pathsText: "",
  result: "",
  loading: false,
});

const initialFormData: ServerPathForm = {
  code: "",
  name: "",
  target: "",
  sources: [""],
  sort: 0,
};

const formData = reactive<ServerPathForm>({ ...initialFormData });

const rules: FormRules = {
  code: [{ required: true, message: "请输入项目编码", trigger: "blur" }],
  name: [{ required: true, message: "请输入项目名称", trigger: "blur" }],
  target: [{ required: true, message: "请输入服务器地址", trigger: "blur" }],
};

async function fetchList() {
  loading.value = true;
  try {
    const data = await ServerPathAPI.getPage(queryParams);
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
  dialogState.title = "新增路径转换";
  Object.assign(formData, initialFormData, { sources: [""] });
  dialogState.visible = true;
}

function handleEditClick(row: ServerPathItem) {
  dialogState.title = "编辑路径转换";
  let sources = [""];
  try {
    if (row.sources) {
      sources = JSON.parse(row.sources);
      if (!Array.isArray(sources)) sources = [""];
    }
  } catch (e) {
    sources = [""];
  }
  Object.assign(formData, {
    id: row.id,
    code: row.code,
    name: row.name,
    target: row.target,
    sources: sources,
    sort: row.sort,
  });
  dialogState.visible = true;
}

function handleAddSource() {
  formData.sources?.push("");
}

function handleRemoveSource(index: number) {
  formData.sources?.splice(index, 1);
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
      await ServerPathAPI.update(formData.id, formData);
      ElMessage.success("修改成功");
    } else {
      await ServerPathAPI.create(formData);
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
    await ServerPathAPI.deleteById(id);
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
    await ServerPathAPI.batchDelete(ids);
    ElMessage.success("批量删除成功");
    fetchList();
  } finally {
    loading.value = false;
  }
}

function handleConvertClick(row: ServerPathItem) {
  convertState.id = row.id;
  convertState.pathsText = "";
  convertState.result = "";
  convertState.visible = true;
}

async function handleDoConvert() {
  const paths = convertState.pathsText.split("\n").map(p => p.trim()).filter(p => p);
  if (!paths.length) {
    ElMessage.warning("请输入路径");
    return;
  }
  convertState.loading = true;
  try {
    const res = await ServerPathAPI.convert(convertState.id, paths);
    convertState.result = Array.isArray(res) ? res.join("\n") : String(res);
    ElMessage.success("转换完成");
  } finally {
    convertState.loading = false;
  }
}

onMounted(() => {
  fetchList();
});
</script>
