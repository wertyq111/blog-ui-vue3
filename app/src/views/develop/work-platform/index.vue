<template>
  <div class="app-container">
    <div class="filter-section">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="平台名称" prop="name">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入平台名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 150px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
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
          <el-button type="success" icon="plus" @click="handleCreateClick">新增</el-button>
        </div>
      </div>

      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="dataList"
        border
        stripe
        row-key="id"
        class="table-section__content"
      >
        <el-table-column width="50" align="center">
          <template #default>
            <el-icon class="drag-handle" style="cursor: move"><Rank /></el-icon>
          </template>
        </el-table-column>
        <el-table-column label="平台名称" prop="name" min-width="200" />
        <el-table-column label="排序" prop="sort" width="100" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? "启用" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="180" align="center" />
        <el-table-column label="更新时间" prop="updateTime" width="180" align="center" />
        <el-table-column label="操作" fixed="right" width="160" align="center">
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
    <el-dialog v-model="dialogState.visible" :title="dialogState.title" width="500px" @close="closeDialog">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="平台名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入平台名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import WorkPlatformAPI from "@/api/develop/work-platform";
import type { WorkPlatformQueryParams, WorkPlatformItem, WorkPlatformForm } from "@/types/api/work-platform";
import { Rank } from "@element-plus/icons-vue";
import { useDraggable } from "vue-draggable-plus";

defineOptions({ name: "WorkPlatform" });

const queryFormRef = ref<FormInstance>();
const formRef = ref<FormInstance>();
const tableRef = ref();

const queryParams = reactive<WorkPlatformQueryParams>({
  pageNum: 1,
  pageSize: 10,
  name: "",
  status: undefined,
});

const loading = ref(false);
const total = ref(0);
const dataList = ref<WorkPlatformItem[]>([]);

const dialogState = reactive({
  visible: false,
  title: "",
});

const initialFormData: WorkPlatformForm = {
  name: "",
  status: 1,
  sort: 0,
};

const formData = reactive<WorkPlatformForm>({ ...initialFormData });

const rules: FormRules = {
  name: [{ required: true, message: "请输入平台名称", trigger: "blur" }],
};

async function fetchList() {
  loading.value = true;
  try {
    const data = await WorkPlatformAPI.getPage(queryParams);
    dataList.value = data.list;
    total.value = data.total;
    nextTick(() => {
      initDraggable();
    });
  } finally {
    loading.value = false;
  }
}

function initDraggable() {
  const el = tableRef.value?.$el.querySelector(".el-table__body-wrapper tbody");
  if (!el) return;
  useDraggable(el, dataList, {
    handle: ".drag-handle",
    onEnd: async (evt) => {
      const { oldIndex, newIndex } = evt;
      if (oldIndex === newIndex) return;
      
      const list = dataList.value.map((item, index) => ({
        id: item.id,
        sort: index,
      }));
      
      loading.value = true;
      try {
        await WorkPlatformAPI.reorder(list);
        ElMessage.success("排序已保存");
        fetchList();
      } catch (error) {
        console.error("Reorder failed", error);
        fetchList();
      } finally {
        loading.value = false;
      }
    },
  });
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
  dialogState.title = "新增工作平台";
  Object.assign(formData, initialFormData);
  dialogState.visible = true;
}

function handleEditClick(row: WorkPlatformItem) {
  dialogState.title = "编辑工作平台";
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    status: row.status,
    sort: row.sort,
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
      await WorkPlatformAPI.update(formData.id, formData);
      ElMessage.success("修改成功");
    } else {
      await WorkPlatformAPI.create(formData);
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
    await ElMessageBox.confirm("确认删除该平台吗？这将导致关联的日常记录显示异常。", "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch {
    return;
  }

  loading.value = true;
  try {
    await WorkPlatformAPI.deleteById(id);
    ElMessage.success("删除成功");
    fetchList();
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchList();
});
</script>
