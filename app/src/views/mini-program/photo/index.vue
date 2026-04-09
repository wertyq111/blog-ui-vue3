<template>
  <div class="develop-page">
    <el-card shadow="never" class="develop-shell">
      <!-- Hero 区域 -->
      <div class="develop-hero">
        <div class="develop-hero__copy">
          <div class="develop-hero__eyebrow">PHOTO</div>
          <h1 class="develop-hero__title">相册管理</h1>
          <p class="develop-hero__desc">管理照片资源</p>
        </div>
      </div>

      <!-- 搜索面板 -->
      <div class="develop-panel">
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="develop-form">
          <el-form-item label="相册" prop="categoryId">
            <el-select v-model="queryParams.categoryId" placeholder="请选择相册" clearable style="width: 180px">
              <el-option v-for="item in categoryList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="描述" prop="remark">
            <el-input
              v-model="queryParams.remark"
              placeholder="请输入描述"
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

      <!-- 表格区域 -->
      <div class="develop-table-shell">
        <div class="develop-table-shell__header">
          <div>
            <div class="develop-table-shell__title">照片列表</div>
            <div class="develop-table-shell__desc">管理所有相册图片，支持预览与批量操作。</div>
          </div>
          <div class="develop-table-shell__actions">
            <el-button type="success" icon="plus" @click="handleCreateClick">新增图片</el-button>
            <el-button type="danger" icon="delete" :disabled="!hasSelection" @click="handleDelete()">
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
          <el-table-column label="相册" min-width="140">
            <template #default="{ row }">
              {{ row.category?.name || "-" }}
            </template>
          </el-table-column>
          <el-table-column label="描述" prop="remark" min-width="220" show-overflow-tooltip />
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
      </div>
    </el-card>

    <el-dialog
      v-model="dialogState.visible"
      :title="dialogState.title"
      width="500px"
      class="develop-dialog"
      @close="closeDialog"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px" class="develop-dialog-form">
        <el-form-item label="相册" prop="categoryId">
          <el-select v-model="formData.categoryId" placeholder="请选择相册" style="width: 100%">
            <el-option v-for="item in categoryList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="原图URL" prop="url">
          <el-input v-model="formData.url" placeholder="请输入图片URL" />
        </el-form-item>
        <el-form-item label="描述" prop="remark">
          <el-input v-model="formData.remark" placeholder="请输入描述" />
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
