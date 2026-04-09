<template>
  <div class="develop-page">
    <el-card shadow="never" class="develop-shell">
      <!-- Hero 区域 -->
      <div class="develop-hero">
        <div class="develop-hero__copy">
          <div class="develop-hero__eyebrow">ROLE MANAGEMENT</div>
          <h1 class="develop-hero__title">角色管理</h1>
          <p class="develop-hero__desc">配置系统角色与权限分配</p>
        </div>
      </div>

      <!-- 搜索面板 -->
      <div class="develop-panel">
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="develop-form">
          <el-form-item prop="filter[name]" label="角色名称">
            <el-input
              v-model="queryParams['filter[name]']"
              placeholder="角色名称"
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
            <div class="develop-table-shell__title">角色列表</div>
            <div class="develop-table-shell__desc">管理系统权限角色，可分配菜单访问与操作权限。</div>
          </div>
          <div class="develop-table-shell__actions">
            <el-button type="success" icon="plus" @click="handleCreateClick()">新增角色</el-button>
            <el-button
              type="danger"
              :disabled="ids.length === 0"
              icon="delete"
              @click="handleBatchDelete()"
            >
              批量删除
            </el-button>
          </div>
        </div>

        <el-table
          ref="dataTableRef"
          v-loading="loading"
          :data="roleList"
          highlight-current-row
          border
          class="develop-table"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="角色名称" prop="name" min-width="100" />
          <el-table-column label="角色编码" prop="code" width="150" />

          <el-table-column label="状态" align="center" width="100">
            <template #default="scope">
              <el-tag v-if="scope.row.status === 1" type="success">正常</el-tag>
              <el-tag v-else type="info">禁用</el-tag>
            </template>
          </el-table-column>

          <el-table-column label="排序" align="center" width="80" prop="sort" />
          <el-table-column label="备注" prop="note" min-width="150" />

          <el-table-column fixed="right" label="操作" width="220">
            <template #default="scope">
              <el-button
                v-hasPerm="'sys:role:assign'"
                type="primary"
                size="small"
                link
                icon="position"
                @click="handleAssignPermClick(scope.row)"
              >
                分配权限
              </el-button>
              <el-button
                type="primary"
                size="small"
                link
                icon="edit"
                @click="handleEditClick(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                link
                icon="delete"
                @click="handleDelete(scope.row.id)"
              >
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

    <!-- 角色表单弹窗 -->
    <el-dialog
      v-model="dialogState.visible"
      :title="dialogState.title"
      width="600px"
      class="develop-dialog"
      @close="closeDialog"
    >
      <el-form ref="roleFormRef" :model="formData" :rules="rules" label-width="100px" class="develop-dialog-form">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入角色名称" />
        </el-form-item>

        <el-form-item label="角色编码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入角色编码" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">正常</el-radio>
            <el-radio :value="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model="formData.sort"
            controls-position="right"
            :min="0"
            style="width: 100px"
          />
        </el-form-item>

        <el-form-item label="备注" prop="note">
          <el-input v-model="formData.note" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="develop-dialog-footer">
          <el-button type="primary" @click="handleSubmit">确定</el-button>
          <el-button @click="closeDialog">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 分配权限弹窗 -->
    <el-drawer
      v-model="assignPermDialogVisible"
      :title="'【' + checkedRole.name + '】权限分配'"
      :size="drawerSize"
    >
      <div class="flex-x-between">
        <el-input v-model="permKeywords" clearable class="w-[150px]" placeholder="菜单权限名称">
          <template #prefix>
            <Search />
          </template>
        </el-input>

        <div class="flex-center ml-5">
          <el-button type="primary" size="small" plain @click="togglePermTree">
            <template #icon>
              <Switch />
            </template>
            {{ isExpanded ? "收缩" : "展开" }}
          </el-button>
          <el-checkbox
            v-model="parentChildLinked"
            class="ml-5"
            @change="handleParentChildLinkedChange"
          >
            父子联动
          </el-checkbox>

          <el-tooltip placement="bottom">
            <template #content>
              如果只需勾选菜单权限，不需要勾选子菜单或者按钮权限，请关闭父子联动
            </template>
            <el-icon class="ml-1 color-[--el-color-primary] inline-block cursor-pointer">
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </div>
      </div>

      <el-tree
        ref="permTreeRef"
        node-key="value"
        show-checkbox
        :data="menuPermOptions"
        :filter-node-method="handlePermFilter"
        :default-expand-all="true"
        :check-strictly="!parentChildLinked"
        class="mt-5"
      >
        <template #default="{ data }">
          {{ data.label }}
        </template>
      </el-tree>
      <template #footer>
        <div class="dialog-footer">
          <el-button v-hasPerm="'sys:role:assign'" type="primary" @click="handleAssignPermSubmit">
            确定
          </el-button>
          <el-button @click="assignPermDialogVisible = false">取消</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>
