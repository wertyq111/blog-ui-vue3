<template>
  <div class="app-container">
    <div class="filter-section">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="分类" prop="classId">
          <el-select v-model="queryParams.classId" placeholder="请选择分类" clearable style="width: 180px">
            <el-option v-for="item in classifyList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="发布者" prop="nickname">
          <el-input
            v-model="queryParams.nickname"
            placeholder="请输入发布者"
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
        <el-table-column label="分类" min-width="120">
          <template #default="{ row }">
            {{ row.classify?.name || "-" }}
          </template>
        </el-table-column>
        <el-table-column label="发布者" prop="nickname" min-width="120" />
        <el-table-column label="标签" min-width="180">
          <template #default="{ row }">
            <el-space v-if="row.tags?.length" wrap>
              <el-tag v-for="tag in row.tags" :key="tag" size="small">{{ tag }}</el-tag>
            </el-space>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="评分" width="190">
          <template #default="{ row }">
            <el-rate :model-value="row.score || 0" disabled show-score />
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

    <el-dialog v-model="dialogState.visible" :title="dialogState.title" width="600px" @close="closeDialog">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="分类" prop="classId">
          <el-select v-model="formData.classId" placeholder="请选择分类" style="width: 100%">
            <el-option v-for="item in classifyList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="原图URL" prop="url">
          <el-input v-model="formData.url" placeholder="请输入图片URL" />
        </el-form-item>
        <el-form-item label="发布者" prop="nickname">
          <el-input v-model="formData.nickname" placeholder="请输入发布者昵称" maxlength="20" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="评分" prop="score">
          <el-rate v-model="formData.score" allow-half />
        </el-form-item>
        <el-form-item label="标签">
          <div class="w-full">
            <el-space wrap>
              <el-tag
                v-for="tag in formData.tags"
                :key="tag"
                closable
                @close="handleRemoveTag(tag)"
              >
                {{ tag }}
              </el-tag>
            </el-space>
            <div class="mt-2 flex items-center gap-2">
              <el-input v-model="newTag" placeholder="输入标签后添加" style="max-width: 220px" @keyup.enter="handleAddTag" />
              <el-button type="primary" plain @click="handleAddTag">添加标签</el-button>
            </div>
          </div>
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
import WallpaperAPI from "@/api/mini-program/wallpaper";
import type { WallpaperClassifyItem } from "@/types/api/wallpaper-classify";
import type { WallpaperQueryParams, WallpaperItem, WallpaperForm } from "@/types/api/wallpaper";
import { useTableSelection } from "@/composables";

defineOptions({ name: "Wallpaper" });

const queryFormRef = ref<FormInstance>();
const formRef = ref<FormInstance>();

const queryParams = reactive<WallpaperQueryParams>({
  pageNum: 1,
  pageSize: 10,
  classId: undefined,
  nickname: "",
});

const loading = ref(false);
const total = ref(0);
const dataList = ref<WallpaperItem[]>([]);
const classifyList = ref<WallpaperClassifyItem[]>([]);

const { selectedIds, hasSelection, handleSelectionChange } = useTableSelection<WallpaperItem>();

const dialogState = reactive({
  visible: false,
  title: "",
});

const initialFormData: WallpaperForm = {
  classId: undefined as unknown as number,
  url: "",
  smallPicUrl: "",
  nickname: "",
  description: "",
  score: 0,
  tags: [],
};

const formData = reactive<WallpaperForm>({ ...initialFormData });
const newTag = ref("");

const rules: FormRules = {
  classId: [{ required: true, message: "请选择分类", trigger: "change" }],
  url: [{ required: true, message: "请输入图片URL", trigger: "blur" }],
  nickname: [
    { required: true, message: "请输入发布者", trigger: "blur" },
    { max: 20, message: "发布者不能超过20个字符", trigger: "blur" },
  ],
};

async function fetchClassifyList() {
  classifyList.value = await WallpaperAPI.getClassifyList();
}

async function fetchList() {
  loading.value = true;
  try {
    const data = await WallpaperAPI.getPage(queryParams);
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
  dialogState.title = "新增壁纸";
  Object.assign(formData, initialFormData, { tags: [] });
  newTag.value = "";
  dialogState.visible = true;
}

function handleEditClick(row: WallpaperItem) {
  dialogState.title = "编辑壁纸";
  Object.assign(formData, {
    id: row.id,
    classId: row.classId,
    url: row.url,
    smallPicUrl: row.smallPicUrl || "",
    nickname: row.nickname,
    description: row.description || "",
    score: row.score || 0,
    tags: [...(row.tags || [])],
  });
  newTag.value = "";
  dialogState.visible = true;
}

function closeDialog() {
  dialogState.visible = false;
  formRef.value?.resetFields();
  newTag.value = "";
}

function handleAddTag() {
  const value = newTag.value.trim();
  if (!value) return;
  if (!formData.tags) formData.tags = [];
  if (!formData.tags.includes(value)) {
    formData.tags.push(value);
  }
  newTag.value = "";
}

function handleRemoveTag(tag: string) {
  formData.tags = (formData.tags || []).filter((item) => item !== tag);
}

async function handleSubmit() {
  await formRef.value?.validate();
  loading.value = true;
  try {
    if (formData.id) {
      await WallpaperAPI.update(formData.id, formData);
      ElMessage.success("修改成功");
    } else {
      await WallpaperAPI.create(formData);
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
    await Promise.all(ids.map((item) => WallpaperAPI.deleteById(item)));
    ElMessage.success("删除成功");
    fetchList();
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await fetchClassifyList();
  fetchList();
});
</script>

