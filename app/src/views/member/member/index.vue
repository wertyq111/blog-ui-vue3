<!-- 会员管理 -->
<template>
  <div class="develop-page">
    <el-card shadow="never" class="develop-shell">
      <!-- Hero 区域 -->
      <div class="develop-hero">
        <div class="develop-hero__copy">
          <div class="develop-hero__eyebrow">MEMBER MANAGEMENT</div>
          <h1 class="develop-hero__title">会员管理</h1>
          <p class="develop-hero__desc">管理注册会员信息与状态</p>
        </div>
      </div>

      <!-- 搜索面板 -->
      <div class="develop-panel">
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="develop-form">
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

      <!-- 表格区域 -->
      <div class="develop-table-shell">
        <div class="develop-table-shell__header">
          <div>
            <div class="develop-table-shell__title">会员列表</div>
            <div class="develop-table-shell__desc">所有注册会员的基础信息与账户状态。</div>
          </div>
          <div class="develop-table-shell__actions">
            <el-button type="success" icon="plus" @click="handleCreateClick">新增会员</el-button>
            <el-button
              type="danger"
              icon="delete"
              :disabled="!hasSelection"
              @click="handleDelete()"
            >
              批量删除
            </el-button>
          </div>
        </div>

        <el-table
          v-loading="loading"
          :data="dataList"
          border
          stripe
          highlight-current-row
          class="develop-table"
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
      </div>
    </el-card>

    <!-- 表单弹窗 -->
    <el-dialog
      v-model="dialogState.visible"
      :title="dialogState.title"
      width="600px"
      class="develop-dialog"
      @close="closeDialog"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px" class="develop-dialog-form">
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
        <div class="develop-dialog-footer">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
