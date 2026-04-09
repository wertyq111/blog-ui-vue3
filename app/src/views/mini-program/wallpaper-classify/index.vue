<template>
  <div class="develop-page">
    <el-card shadow="never" class="develop-shell">
      <!-- Hero 区域 -->
      <div class="develop-hero">
        <div class="develop-hero__copy">
          <div class="develop-hero__eyebrow">WALLPAPER CLASSIFY</div>
          <h1 class="develop-hero__title">壁纸分类</h1>
          <p class="develop-hero__desc">管理小程序壁纸分类目录</p>
        </div>
      </div>

      <!-- 搜索面板 -->
      <div class="develop-panel">
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="develop-form">
          <el-form-item label="分类名称" prop="name">
            <el-input
              v-model="queryParams.name"
              placeholder="请输入分类名称"
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
            <div class="develop-table-shell__title">分类列表</div>
            <div class="develop-table-shell__desc">定义壁纸分类及其展示顺序和封面。</div>
          </div>
          <div class="develop-table-shell__actions">
            <el-button type="success" icon="plus" @click="handleCreateClick">新增分类</el-button>
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
          <el-table-column label="分类名称" prop="name" min-width="140" />
          <el-table-column label="封面图" width="100" align="center">
            <template #default="{ row }">
              <el-image
                v-if="row.picUrl"
                :src="row.picUrl"
                style="width: 60px; height: 60px; border-radius: 6px"
                fit="cover"
              />
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="推荐" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.select ? 'success' : 'info'">
                {{ row.select ? "推荐" : "普通" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="排序" prop="sort" width="90" align="center" />
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
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入分类名称" maxlength="20" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" controls-position="right" />
        </el-form-item>
        <el-form-item label="封面图URL" prop="picUrl">
          <el-input v-model="formData.picUrl" placeholder="请输入封面图URL" />
        </el-form-item>
        <el-form-item label="是否推荐" prop="select">
          <el-switch v-model="formData.select" />
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
