<template>
  <div class="develop-page">
    <el-card shadow="never" class="develop-shell">
      <!-- Hero 区域 -->
      <div class="develop-hero">
        <div class="develop-hero__copy">
          <div class="develop-hero__eyebrow">WALLPAPER</div>
          <h1 class="develop-hero__title">壁纸管理</h1>
          <p class="develop-hero__desc">管理小程序壁纸资源</p>
        </div>
      </div>

      <!-- 搜索面板 -->
      <div class="develop-panel">
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="develop-form">
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

      <!-- 表格区域 -->
      <div class="develop-table-shell">
        <div class="develop-table-shell__header">
          <div>
            <div class="develop-table-shell__title">壁纸资源列表</div>
            <div class="develop-table-shell__desc">所有上传的壁纸资源，支持分类和发布者筛选。</div>
          </div>
          <div class="develop-table-shell__actions">
            <el-button type="success" icon="plus" @click="handleCreateClick">新增壁纸</el-button>
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
          <el-table-column label="分类" min-width="120">
            <template #default="{ row }">
              {{ row.classify?.name || "-" }}
            </template>
          </el-table-column>
          <el-table-column label="发布者" prop="nickname" min-width="120" />
          <el-table-column label="标签" min-width="180">
            <template #default="{ row }">
              <el-space v-if="row.tags?.length" wrap>
                <el-tag v-for="tag in row.tags" :key="tag" size="small" effect="plain">{{ tag }}</el-tag>
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
      </div>
    </el-card>

    <el-dialog
      v-model="dialogState.visible"
      :title="dialogState.title"
      width="600px"
      class="develop-dialog"
      @close="closeDialog"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px" class="develop-dialog-form">
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
        <div class="develop-dialog-footer">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
