<!-- 会员等级管理 -->
<template>
  <div class="app-container">
    <div class="filter-section">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="等级名称" prop="name">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入等级名称"
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
          <el-button
            type="danger"
            icon="delete"
            :disabled="!hasSelection"
            @click="handleDelete()"
          >
            删除
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="dataList"
        border
        stripe
        highlight-current-row
        class="table-section__content"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column label="ID" prop="id" width="80" align="center" />
        <el-table-column label="等级名称" prop="name" align="center" />
        <el-table-column label="排序" prop="sort" width="100" align="center" />
        <el-table-column label="创建时间" prop="createTime" align="center" width="180" />
        <el-table-column label="操作" fixed="right" width="150" align="center">
          <template #default="scope">
            <el-button type="primary" icon="edit" link size="small" @click="handleEditClick(scope.row)">
              编辑
            </el-button>
            <el-button type="danger" icon="delete" link size="small" @click="handleDelete(scope.row.id)">
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

    <!-- 表单弹窗 -->
    <el-dialog
      v-model="dialogState.visible"
      :title="dialogState.title"
      width="500px"
      @close="closeDialog"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="等级名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入等级名称" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" controls-position="right" />
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
import { onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import MemberLevelAPI from "@/api/member/member-level";
import type { MemberLevelItem, MemberLevelQueryParams, MemberLevelForm } from "@/types/api";
import { useTableSelection } from "@/composables";

defineOptions({
  name: "MemberLevel",
});

const queryFormRef = ref<FormInstance>();
const formRef = ref<FormInstance>();

const queryParams = reactive<MemberLevelQueryParams>({
  pageNum: 1,
  pageSize: 10,
  name: "",
});

const loading = ref(false);
const total = ref(0);
const dataList = ref<MemberLevelItem[]>([]);

const { selectedIds, hasSelection, handleSelectionChange } = useTableSelection<MemberLevelItem>();

const dialogState = reactive({
  visible: false,
  title: "",
});

const initialFormData: MemberLevelForm = {
  name: "",
  sort: 0,
};

const formData = reactive<MemberLevelForm>({ ...initialFormData });

const rules: FormRules = {
  name: [{ required: true, message: "请输入等级名称", trigger: "blur" }],
};

async function fetchList() {
  loading.value = true;
  try {
    const data = await MemberLevelAPI.getPage(queryParams);
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
  dialogState.title = "新增会员等级";
  Object.assign(formData, initialFormData);
  dialogState.visible = true;
}

function handleEditClick(row: MemberLevelItem) {
  dialogState.title = "编辑会员等级";
  Object.assign(formData, {
    id: row.id,
    name: row.name,
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
      await MemberLevelAPI.update(formData.id, formData);
      ElMessage.success("修改成功");
    } else {
      await MemberLevelAPI.create(formData);
      ElMessage.success("新增成功");
    }
    closeDialog();
    fetchList();
  } finally {
    loading.value = false;
  }
}

function handleDelete(id?: number) {
  const ids = id ? [id] : (selectedIds.value as number[]);
  if (!ids.length) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  ElMessageBox.confirm("确认删除选中的项吗？", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    loading.value = true;
    try {
      await MemberLevelAPI.deleteByIds(ids);
      ElMessage.success("删除成功");
      fetchList();
    } finally {
      loading.value = false;
    }
  });
}

onMounted(() => {
  fetchList();
});
</script>
