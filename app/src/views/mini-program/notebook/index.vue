<template>
  <div class="develop-page">
    <el-card shadow="never" class="develop-shell">
      <!-- Hero 区域 -->
      <div class="develop-hero">
        <div class="develop-hero__copy">
          <div class="develop-hero__eyebrow">NOTEBOOK</div>
          <h1 class="develop-hero__title">笔记管理</h1>
          <p class="develop-hero__desc">管理笔记文章内容</p>
        </div>
      </div>

      <!-- 搜索面板 -->
      <div class="develop-panel">
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="develop-form">
          <el-form-item label="标题" prop="title">
            <el-input v-model="queryParams.title" placeholder="请输入标题" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="分类" prop="categoryId">
            <el-select v-model="queryParams.categoryId" placeholder="请选择分类" clearable style="width: 180px">
              <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
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
            <div class="develop-table-shell__title">笔记文章列表</div>
            <div class="develop-table-shell__desc">发布与管理笔记内容，支持分类展示。</div>
          </div>
          <div class="develop-table-shell__actions">
            <el-button type="success" icon="plus" @click="handleCreateClick">新增笔记</el-button>
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
          <el-table-column type="index" label="#" width="50" align="center" />
          <el-table-column label="标题" prop="title" min-width="220" show-overflow-tooltip />
          <el-table-column label="分类" min-width="120">
            <template #default="{ row }">{{ row.category?.name || "-" }}</template>
          </el-table-column>
          <el-table-column label="标签" min-width="120">
            <template #default="{ row }">{{ row.label?.name || "-" }}</template>
          </el-table-column>
          <el-table-column label="浏览量" prop="viewCount" width="90" align="center" />
          <el-table-column label="点赞" prop="likeCount" width="90" align="center" />
          <el-table-column label="发布者" min-width="120">
            <template #default="{ row }">{{ row.member?.nickname || "-" }}</template>
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
      </div>
    </el-card>

    <el-dialog
      v-model="dialogState.visible"
      :title="dialogState.title"
      width="750px"
      class="develop-dialog"
      @close="closeDialog"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="110px" class="develop-dialog-form">
        <el-form-item label="标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="formData.categoryId" placeholder="请选择分类" style="width: 100%">
            <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签" prop="labelId">
          <el-select v-model="formData.labelId" placeholder="请选择标签" clearable style="width: 100%">
            <el-option v-for="item in currentLabels" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="封面URL" prop="cover">
          <el-input v-model="formData.cover" placeholder="请输入封面图URL" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="formData.content" type="textarea" :rows="8" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="公开状态" prop="viewStatus">
          <el-switch v-model="formData.viewStatus" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="评论状态" prop="commentStatus">
          <el-switch v-model="formData.commentStatus" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="推荐状态" prop="recommendStatus">
          <el-switch v-model="formData.recommendStatus" :active-value="1" :inactive-value="0" />
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
