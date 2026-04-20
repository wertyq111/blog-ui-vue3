<template>
  <div class="develop-page admin-workspace-page">
    <el-card shadow="never" class="develop-shell admin-workspace-shell">
      <section class="develop-hero">
        <div class="develop-hero__copy">
          <div class="develop-hero__eyebrow">Develop Workspace</div>
          <div class="develop-hero__title">路径转换</div>
          <div class="develop-hero__desc">管理项目的本地与远程路径映射关系，快捷转换部署路径。</div>
        </div>
      </section>

      <section class="develop-panel develop-panel--filter">
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="develop-form">
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
      </section>

      <section class="develop-table-shell">
        <div class="develop-table-shell__header">
          <div>
            <div class="develop-table-shell__title">路径映射列表</div>
            <div class="develop-table-shell__desc">配置本地开发路径与服务器部署路径的对应关系。</div>
          </div>
          <div class="develop-table-shell__actions">
            <el-button type="success" icon="plus" @click="handleCreateClick">新增映射</el-button>
            <el-button type="danger" icon="delete" :disabled="!hasSelection" @click="handleBatchDelete">
              批量删除
            </el-button>
            <el-button
              :icon="convertPanelVisible ? 'close' : 'sort'"
              :type="convertPanelVisible ? 'warning' : 'primary'"
              @click="toggleConvertPanel"
            >路径转换</el-button>
          </div>
        </div>

        <!-- 转换面板 -->
        <div v-if="convertPanelVisible" class="convert-panel">
          <div class="convert-panel__body">
            <div class="convert-panel__col">
              <div class="convert-panel__label">输入路径 (每行一个)</div>
              <el-input
                v-model="convertInput"
                type="textarea"
                :rows="6"
                placeholder="粘贴或输入需要转换的路径..."
                @input="onConvertInput"
              />
            </div>
            <div class="convert-panel__col">
              <div class="convert-panel__label">转换结果</div>
              <el-input
                v-model="convertOutput"
                type="textarea"
                :rows="6"
                readonly
              />
            </div>
          </div>
          <div class="convert-panel__footer">
            <el-button size="small" @click="clearConvert">清空</el-button>
            <el-button
              v-if="convertOutput"
              size="small"
              type="primary"
              icon="document-copy"
              @click="copyResult"
            >复制结果</el-button>
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
          <el-table-column label="操作" fixed="right" width="130" align="center">
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
      </section>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogState.visible"
      :title="dialogState.title"
      width="600px"
      class="develop-dialog"
      @close="closeDialog"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="110px" class="develop-dialog-form">
        <el-form-item label="项目编码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入项目编码" maxlength="20" />
        </el-form-item>
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入项目名称" maxlength="20" />
        </el-form-item>
        <el-form-item label="网址" prop="url">
          <el-input v-model="formData.url" placeholder="请输入网址" maxlength="120" />
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
        <div class="develop-dialog-footer">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus";
import { useDebounceFn, useClipboard } from "@vueuse/core";
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

// 转换面板状态
const convertPanelVisible = ref(false);
const convertInput = ref("");
const convertOutput = ref("");
const allServerPaths = ref<ServerPathItem[]>([]);

const { copy } = useClipboard();

const initialFormData: ServerPathForm = {
  code: "",
  name: "",
  url: "",
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
    url: row.url ?? "",
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

/* 转换面板 */
async function toggleConvertPanel() {
  convertPanelVisible.value = !convertPanelVisible.value;
  if (convertPanelVisible.value && !allServerPaths.value.length) {
    try {
      allServerPaths.value = await ServerPathAPI.getAll();
    } catch {
      ElMessage.error("加载项目配置失败");
    }
  }
}

function parseSources(raw: string): string[] {
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function autoConvert() {
  const input = convertInput.value;
  if (!input || !input.trim()) {
    convertOutput.value = "";
    return;
  }
  const lines = input.split("\n");
  const results = lines.map((line) => {
    if (!line.trim()) return "";
    let processed = line
      .replace(/[\u4e00-\u9fa5]/g, "")
      .replace(/\|/g, "/")
      .trim();
    if (!processed) return "";
    for (const item of allServerPaths.value) {
      const sources = parseSources(item.sources);
      for (const source of sources) {
        const escaped = source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        if (new RegExp(escaped).test(processed)) {
          processed = processed.replace(new RegExp(escaped), item.target);
          return processed.replace(/\\/g, "/");
        }
      }
    }
    return processed.replace(/\\/g, "/");
  });
  convertOutput.value = results.filter(Boolean).join(" ");
}

const onConvertInput = useDebounceFn(autoConvert, 300);

async function copyResult() {
  if (!convertOutput.value) return;
  try {
    await copy(convertOutput.value);
    ElMessage.success("已复制到剪贴板");
  } catch {
    ElMessage.error("复制失败");
  }
}

function clearConvert() {
  convertInput.value = "";
  convertOutput.value = "";
}

onMounted(() => {
  fetchList();
});
</script>

<style scoped>
.convert-panel {
  margin: 14px 0 16px;
  padding: 16px;
  border-radius: 8px;
  border: 1px dashed var(--develop-border, rgba(215, 228, 205, 0.86));
  background: var(--develop-panel-bg, rgba(247, 251, 243, 0.6));
}

.convert-panel__body {
  display: flex;
  gap: 16px;
}

.convert-panel__col {
  flex: 1;
  min-width: 0;
}

.convert-panel__label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--develop-text-soft, #5e6e5a);
}

.convert-panel__footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
</style>
