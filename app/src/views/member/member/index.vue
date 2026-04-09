<!-- 会员管理 -->
<template>
  <div class="app-container">
    <div class="filter-section">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="昵称" prop="nickname">
          <el-input
            v-model="queryParams.nickname"
            placeholder="请输入昵称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="queryParams.phone"
            placeholder="请输入手机号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="会员等级" prop="memberLevel">
          <el-select
            v-model="queryParams.memberLevel"
            placeholder="全部"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="item in levelOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 100px">
            <el-option label="正常" :value="1" />
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
        <el-table-column label="头像" width="100" align="center">
          <template #default="scope">
            <el-avatar :size="40" :src="scope.row.avatar" />
          </template>
        </el-table-column>
        <el-table-column label="昵称" prop="nickname" align="center" min-width="120" />
        <el-table-column label="真实姓名" prop="realname" align="center" width="120" />
        <el-table-column label="性别" width="80" align="center">
          <template #default="scope">
            <span v-if="scope.row.gender === 1">男</span>
            <span v-else-if="scope.row.gender === 2">女</span>
            <span v-else>保密</span>
          </template>
        </el-table-column>
        <el-table-column label="会员等级" align="center" width="120">
          <template #default="scope">
            {{ getLevelName(scope.row.memberLevel) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? "正常" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="设备" prop="device" align="center" width="100" />
        <el-table-column label="登录次数" prop="loginCount" align="center" width="100" />
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
      width="600px"
      @close="closeDialog"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="formData.nickname" placeholder="请输入昵称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="真实姓名" prop="realname">
              <el-input v-model="formData.realname" placeholder="请输入真实姓名" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-select v-model="formData.gender" placeholder="请选择性别">
                <el-option label="男" :value="1" />
                <el-option label="女" :value="2" />
                <el-option label="保密" :value="0" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="会员等级" prop="memberLevel">
              <el-select v-model="formData.memberLevel" placeholder="请选择等级">
                <el-option
                  v-for="item in levelOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="formData.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生日" prop="birthday">
              <el-date-picker
                v-model="formData.birthday"
                type="date"
                placeholder="选择日期"
                value-format="timestamp"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="头像" prop="avatar">
          <single-upload v-model="formData.avatar" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="formData.status"
            :active-value="1"
            :inactive-value="0"
            active-text="正常"
            inactive-text="禁用"
            inline-prompt
          />
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
import MemberAPI from "@/api/member/member";
import MemberLevelAPI from "@/api/member/member-level";
import type { MemberItem, MemberQueryParams, MemberForm } from "@/types/api";
import { useTableSelection } from "@/composables";

defineOptions({
  name: "Member",
});

const queryFormRef = ref<FormInstance>();
const formRef = ref<FormInstance>();

const queryParams = reactive<MemberQueryParams>({
  pageNum: 1,
  pageSize: 10,
  nickname: "",
  phone: "",
  status: undefined,
  memberLevel: undefined,
});

const loading = ref(false);
const total = ref(0);
const dataList = ref<MemberItem[]>([]);
const levelOptions = ref<any[]>([]);

const { selectedIds, hasSelection, handleSelectionChange } = useTableSelection<MemberItem>();

const dialogState = reactive({
  visible: false,
  title: "",
});

const initialFormData: MemberForm = {
  nickname: "",
  realname: "",
  gender: 0,
  avatar: "",
  birthday: undefined,
  memberLevel: 0,
  phone: "",
  status: 1,
};

const formData = reactive<MemberForm>({ ...initialFormData });

const rules: FormRules = {
  nickname: [{ required: true, message: "请输入昵称", trigger: "blur" }],
  memberLevel: [{ required: true, message: "请选择会员等级", trigger: "change" }],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号码", trigger: "blur" }],
};

async function fetchList() {
  loading.value = true;
  try {
    const data = await MemberAPI.getPage(queryParams);
    dataList.value = data.list;
    total.value = data.total;
  } finally {
    loading.value = false;
  }
}

async function fetchLevelOptions() {
  const options = await MemberLevelAPI.getOptions();
  levelOptions.value = options;
}

function getLevelName(levelId: number) {
  const level = levelOptions.value.find((item) => item.value === levelId);
  return level ? level.label : "未知等级";
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
  dialogState.title = "新增会员";
  Object.assign(formData, initialFormData);
  dialogState.visible = true;
}

function handleEditClick(row: MemberItem) {
  dialogState.title = "编辑会员";
  Object.assign(formData, {
    id: row.id,
    nickname: row.nickname,
    realname: row.realname,
    gender: row.gender,
    avatar: row.avatar,
    birthday: row.birthday,
    memberLevel: row.memberLevel,
    phone: row.phone,
    status: row.status,
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
      await MemberAPI.update(formData.id, formData);
      ElMessage.success("修改成功");
    } else {
      await MemberAPI.create(formData);
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

  ElMessageBox.confirm("确认删除选中的会员吗？", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    loading.value = true;
    try {
      await MemberAPI.deleteByIds(ids);
      ElMessage.success("删除成功");
      fetchList();
    } finally {
      loading.value = false;
    }
  });
}

onMounted(() => {
  fetchLevelOptions();
  fetchList();
});
</script>
