<template>
  <div class="app-container">
    <div class="filter-section">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="平台" prop="platformId">
          <el-select v-model="queryParams.platformId" placeholder="全部" clearable style="width: 150px">
            <el-option v-for="item in platforms" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="queryParams.content"
            placeholder="请输入内容"
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
        </div>
      </div>

      <el-table v-loading="loading" :data="dataList" border stripe class="table-section__content">
        <el-table-column label="ID" prop="id" width="80" align="center" />
        <el-table-column label="日期" prop="logDate" width="120" align="center" />
        <el-table-column label="内容" min-width="400">
          <template #default="{ row }">
            <div v-if="typeof row.content === 'object' && row.content.platforms" class="daily-summary">
              <div v-for="p in row.content.platforms" :key="p.platform_id" class="mb-1">
                <el-tag size="small" type="info" class="mr-1">【{{ p.platform_name }}】</el-tag>
                <span class="text-gray-500">{{ stripHtml(p.content).substring(0, 100) }}...</span>
              </div>
            </div>
            <div v-else class="text-gray-500">
              {{ stripHtml(String(row.content)).substring(0, 200) }}...
            </div>
          </template>
        </el-table-column>
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogState.visible" :title="dialogState.title" width="900px" @close="closeDialog">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="日期" prop="logDate">
              <el-date-picker
                v-model="formData.logDate"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="平台" prop="platformIds">
              <el-select
                v-model="selectedPlatformIds"
                multiple
                placeholder="请选择平台"
                style="width: 100%"
              >
                <el-option
                  v-for="item in platforms"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <div v-for="id in selectedPlatformIds" :key="id" class="platform-editor mt-4">
          <div class="platform-editor__header mb-2 font-bold text-blue-600">
            <el-icon class="mr-1"><Platform /></el-icon>
            {{ getPlatformName(id) }}
          </div>
          <WangEditor v-model="platformContentMap[id]" height="300px" />
        </div>
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
import WorkDailyAPI from "@/api/develop/work-daily";
import WorkPlatformAPI from "@/api/develop/work-platform";
import type { WorkDailyQueryParams, WorkDailyItem, WorkDailyForm } from "@/types/api/work-daily";
import type { WorkPlatformItem } from "@/types/api/work-platform";
import WangEditor from "@/components/WangEditor/index.vue";
import { Platform } from "@element-plus/icons-vue";

defineOptions({ name: "WorkDaily" });

const queryFormRef = ref<FormInstance>();
const formRef = ref<FormInstance>();

const queryParams = reactive<WorkDailyQueryParams>({
  pageNum: 1,
  pageSize: 10,
  platformId: undefined,
  content: "",
});

const dateRange = ref<[string, string]>();
const loading = ref(false);
const total = ref(0);
const dataList = ref<WorkDailyItem[]>([]);
const platforms = ref<WorkPlatformItem[]>([]);

const dialogState = reactive({
  visible: false,
  title: "",
});

const formData = reactive({
  id: undefined as number | undefined,
  logDate: "",
});

const selectedPlatformIds = ref<number[]>([]);
const platformContentMap = reactive<Record<number, string>>({});

const rules: FormRules = {
  logDate: [{ required: true, message: "请选择日期", trigger: "change" }],
};

async function fetchPlatforms() {
  platforms.value = await WorkPlatformAPI.getList(1);
}

async function fetchList() {
  loading.value = true;
  if (dateRange.value) {
    queryParams.startDate = dateRange.value[0];
    queryParams.endDate = dateRange.value[1];
  } else {
    queryParams.startDate = undefined;
    queryParams.endDate = undefined;
  }
  try {
    const data = await WorkDailyAPI.getPage(queryParams);
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
  dateRange.value = undefined;
  queryFormRef.value?.resetFields();
  handleQuery();
}

function handleCreateClick() {
  dialogState.title = "新增工作日常";
  formData.id = undefined;
  formData.logDate = new Date().toISOString().substring(0, 10);
  selectedPlatformIds.value = [];
  // Clear map
  for (const key in platformContentMap) {
    delete platformContentMap[key];
  }
  dialogState.visible = true;
}

async function handleEditClick(row: WorkDailyItem) {
  dialogState.title = "编辑工作日常";
  loading.value = true;
  try {
    const info = await WorkDailyAPI.getInfo(row.id);
    formData.id = info.id;
    formData.logDate = info.logDate;
    
    selectedPlatformIds.value = [];
    for (const key in platformContentMap) {
      delete platformContentMap[key];
    }

    if (info.content && typeof info.content === 'object' && info.content.platforms) {
      info.content.platforms.forEach((p: any) => {
        selectedPlatformIds.value.push(p.platform_id);
        platformContentMap[p.platform_id] = p.content;
      });
    }
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
  
  if (selectedPlatformIds.value.length === 0) {
    ElMessage.warning("请至少选择一个平台");
    return;
  }

  const platformsData = selectedPlatformIds.value.map(id => ({
    platform_id: id,
    platform_name: getPlatformName(id),
    content: platformContentMap[id] || ""
  }));

  const submitData: WorkDailyForm = {
    id: formData.id,
    logDate: formData.logDate,
    platforms: platformsData
  };

  loading.value = true;
  try {
    if (submitData.id) {
      await WorkDailyAPI.update(submitData.id, submitData);
      ElMessage.success("修改成功");
    } else {
      await WorkDailyAPI.create(submitData);
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
    await ElMessageBox.confirm("确认删除该记录吗？", "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch {
    return;
  }

  loading.value = true;
  try {
    await WorkDailyAPI.deleteById(id);
    ElMessage.success("删除成功");
    fetchList();
  } finally {
    loading.value = false;
  }
}

function getPlatformName(id: number) {
  return platforms.value.find(p => p.id === id)?.name || "未知平台";
}

function stripHtml(html: string) {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

onMounted(async () => {
  await fetchPlatforms();
  fetchList();
});
</script>

<style scoped>
.platform-editor {
  border: 1px solid var(--el-border-color-lighter);
  padding: 12px;
  border-radius: 4px;
}
</style>
