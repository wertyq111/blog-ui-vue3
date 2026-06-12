<!-- 工作日常：数据报表导出与 Markdown 导入 -->
<template>
  <div class="report-panel">
    <!-- 全局 SVG 渐变定义（用于多组件高效引用，无缝对齐） -->
    <svg style="position: absolute; width: 0; height: 0; overflow: hidden" aria-hidden="true">
      <defs>
        <!-- Codex 经典开发云蓝紫渐变（还原图一） -->
        <linearGradient id="codexCloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#8e85ff" />
          <stop offset="100%" stop-color="#2545ff" />
        </linearGradient>

        <!-- Gemini Google 双子星经典极光渐变 -->
        <linearGradient id="geminiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#a376eb" />
          <stop offset="45%" stop-color="#4285f4" />
          <stop offset="75%" stop-color="#24bca8" />
          <stop offset="100%" stop-color="#34a853" />
        </linearGradient>
        <linearGradient id="geminiGradSmall" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ff8b7f" />
          <stop offset="50%" stop-color="#fbbc05" />
          <stop offset="100%" stop-color="#a376eb" />
        </linearGradient>

        <!-- Claude 暖陶橙旋瓣标识 -->
        <linearGradient id="claudePetalGrad" x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stop-color="#f0aa82" />
          <stop offset="45%" stop-color="#d97757" />
          <stop offset="100%" stop-color="#ad4f37" />
        </linearGradient>
        <radialGradient id="claudeCoreGrad" cx="42%" cy="35%" r="70%">
          <stop offset="0%" stop-color="#fff0df" />
          <stop offset="55%" stop-color="#e58d68" />
          <stop offset="100%" stop-color="#b9553c" />
        </radialGradient>
      </defs>
    </svg>

    <div class="report-panel__head">
      <div class="report-panel__title">数据报表与导入</div>
      <div class="report-panel__desc">快速生成阶段性工作汇报，或从外部 Markdown 文件导入记录。</div>
    </div>
    <div class="report-panel__row">
      <AnimalSelect v-model="config.type" class="report-field" :options="typeOptions" />

      <AnimalDatePicker
        v-if="config.type === 'month'"
        v-model="config.month"
        type="month"
        placeholder="选择月份"
        value-format="YYYY-MM"
        class="report-field"
        style="width: 160px !important"
      />
      <div v-else-if="config.type === 'week'" class="report-field-range-wrap">
        <AnimalDatePicker v-model="config.weekRange" type="daterange" value-format="YYYY-MM-DD" />
      </div>
      <AnimalDatePicker
        v-else
        v-model="config.year"
        type="year"
        placeholder="选择年份"
        value-format="YYYY"
        class="report-field"
        style="width: 160px !important"
      />

      <div ref="modelSelectRef" class="report-model-select">
        <button
          type="button"
          class="report-model-select__trigger"
          :class="{ 'is-open': modelMenuOpen }"
          @click="toggleModelMenu"
        >
          <div class="report-model-select__trigger-content">
            <div v-if="selectedAgentKey" class="agent-logo-wrapper mini" :class="selectedAgentKey">
              <!-- OpenClaw 图二红色小怪兽吉祥物 (微缩版) -->
              <svg v-if="selectedAgentKey === 'openclaw'" viewBox="0 0 32 32" class="svg-openclaw">
                <g class="claw-robot-group">
                  <path
                    class="claw-antenna-l"
                    d="M12.5 10 C12 8, 11 6.5, 9.5 7"
                    stroke="#eb4141"
                    stroke-width="1.3"
                    stroke-linecap="round"
                    fill="none"
                  />
                  <path
                    class="claw-antenna-r"
                    d="M19.5 10 C20 8, 21 6.5, 22.5 7"
                    stroke="#eb4141"
                    stroke-width="1.3"
                    stroke-linecap="round"
                    fill="none"
                  />
                  <rect
                    class="claw-leg-l"
                    x="13"
                    y="23"
                    width="2"
                    height="3.5"
                    rx="0.6"
                    fill="#eb4141"
                  />
                  <rect
                    class="claw-leg-r"
                    x="17"
                    y="23"
                    width="2"
                    height="3.5"
                    rx="0.6"
                    fill="#eb4141"
                  />
                  <circle class="claw-body" cx="16" cy="16.5" r="7.5" fill="#eb4141" />
                  <path
                    class="claw-hand-l"
                    d="M8.5 14.5 C6.5 15.5, 6.5 18.5, 8.5 19.5 C9 19, 9.5 17.5, 9 15.5 Z"
                    fill="#eb4141"
                  />
                  <path
                    class="claw-hand-r"
                    d="M23.5 14.5 C25.5 15.5, 25.5 18.5, 23.5 19.5 C23 19, 22.5 17.5, 23 15.5 Z"
                    fill="#eb4141"
                  />
                  <circle class="claw-eye-l" cx="13" cy="14" r="1.3" fill="#00f3db" />
                  <circle class="claw-eye-r" cx="19" cy="14" r="1.3" fill="#00f3db" />
                  <circle class="claw-eye-glow-l" cx="12.6" cy="13.6" r="0.4" fill="#ffffff" />
                  <circle class="claw-eye-glow-r" cx="18.6" cy="13.6" r="0.4" fill="#ffffff" />
                </g>
              </svg>
              <!-- Codex 图一蓝紫命令云 (微缩版) -->
              <svg v-else-if="selectedAgentKey === 'codex'" viewBox="0 0 32 32" class="svg-codex">
                <rect
                  x="2"
                  y="2"
                  width="28"
                  height="28"
                  rx="6.5"
                  fill="#ffffff"
                  stroke="rgba(121, 79, 39, 0.08)"
                  stroke-width="0.5"
                />
                <path
                  class="codex-cloud"
                  d="M16 6.5 C20 6.5, 23 9.5, 23 13.5 C25.5 13.5, 27.5 15.5, 27.5 18 C27.5 21, 25 23.5, 22 23.5 L10 23.5 C7 23.5, 4.5 21, 4.5 18 C4.5 15.5, 6.5 13.5, 9 13.5 C9 9.5, 12 6.5, 16 6.5 Z"
                  fill="url(#codexCloudGrad)"
                />
                <g class="char-wrapper-gt">
                  <path
                    class="char-gt"
                    d="M10.5 12 L14.5 15 L10.5 18"
                    stroke="#ffffff"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    fill="none"
                  />
                </g>
                <g class="char-wrapper-cursor">
                  <line
                    class="char-cursor"
                    x1="16.5"
                    y1="18"
                    x2="21.5"
                    y2="18"
                    stroke="#ffffff"
                    stroke-width="2.2"
                    stroke-linecap="round"
                  />
                </g>
              </svg>
              <!-- Gemini 双四角星 (微缩版) -->
              <svg v-else-if="selectedAgentKey === 'gemini'" viewBox="0 0 32 32" class="svg-gemini">
                <path
                  class="star-main"
                  d="M14 4 C14 10, 10 14, 4 14 C10 14, 14 18, 14 24 C14 18, 18 14, 24 14 C18 14, 14 10, 14 4 Z"
                  fill="url(#geminiGrad)"
                />
                <path
                  class="star-sub"
                  d="M24 20 C24 23, 23 24, 20 24 C23 24, 24 25, 24 28 C24 25, 25 24, 28 24 C25 24, 24 23, 24 20 Z"
                  fill="url(#geminiGradSmall)"
                />
              </svg>
              <!-- Claude 暖陶橙旋瓣标识 (微缩版) -->
              <svg v-else-if="selectedAgentKey === 'claude'" viewBox="0 0 24 24" class="svg-claude">
                <g class="claude-spin">
                  <g class="claude-bloom">
                    <path
                      class="claude-logo-path"
                      d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z"
                      fill="url(#claudePetalGrad)"
                    />
                  </g>
                </g>
              </svg>
            </div>
            <span>{{ selectedModelLabel }}</span>
          </div>
          <el-icon><ArrowDown /></el-icon>
        </button>
        <div v-if="modelMenuOpen" class="report-model-select__menu">
          <button
            v-for="agent in modelAgents"
            :key="agent.key"
            type="button"
            class="report-model-select__agent"
            :class="{
              'is-active': activeAgentKey === agent.key,
              'is-selected': isAgentSelected(agent),
            }"
            @mouseenter="activeAgentKey = agent.key"
            @click="handleAgentClick(agent)"
          >
            <div class="agent-logo-wrapper" :class="agent.key">
              <!-- OpenClaw 图二红色小怪兽吉祥物 -->
              <svg v-if="agent.key === 'openclaw'" viewBox="0 0 32 32" class="svg-openclaw">
                <g class="claw-robot-group">
                  <path
                    class="claw-antenna-l"
                    d="M12.5 10 C12 8, 11 6.5, 9.5 7"
                    stroke="#eb4141"
                    stroke-width="1.3"
                    stroke-linecap="round"
                    fill="none"
                  />
                  <path
                    class="claw-antenna-r"
                    d="M19.5 10 C20 8, 21 6.5, 22.5 7"
                    stroke="#eb4141"
                    stroke-width="1.3"
                    stroke-linecap="round"
                    fill="none"
                  />
                  <rect
                    class="claw-leg-l"
                    x="13"
                    y="23"
                    width="2"
                    height="3.5"
                    rx="0.6"
                    fill="#eb4141"
                  />
                  <rect
                    class="claw-leg-r"
                    x="17"
                    y="23"
                    width="2"
                    height="3.5"
                    rx="0.6"
                    fill="#eb4141"
                  />
                  <circle class="claw-body" cx="16" cy="16.5" r="7.5" fill="#eb4141" />
                  <path
                    class="claw-hand-l"
                    d="M8.5 14.5 C6.5 15.5, 6.5 18.5, 8.5 19.5 C9 19, 9.5 17.5, 9 15.5 Z"
                    fill="#eb4141"
                  />
                  <path
                    class="claw-hand-r"
                    d="M23.5 14.5 C25.5 15.5, 25.5 18.5, 23.5 19.5 C23 19, 22.5 17.5, 23 15.5 Z"
                    fill="#eb4141"
                  />
                  <circle class="claw-eye-l" cx="13" cy="14" r="1.3" fill="#00f3db" />
                  <circle class="claw-eye-r" cx="19" cy="14" r="1.3" fill="#00f3db" />
                  <circle class="claw-eye-glow-l" cx="12.6" cy="13.6" r="0.4" fill="#ffffff" />
                  <circle class="claw-eye-glow-r" cx="18.6" cy="13.6" r="0.4" fill="#ffffff" />
                </g>
              </svg>
              <!-- Codex 图一蓝紫命令云 -->
              <svg v-else-if="agent.key === 'codex'" viewBox="0 0 32 32" class="svg-codex">
                <rect
                  x="2"
                  y="2"
                  width="28"
                  height="28"
                  rx="6.5"
                  fill="#ffffff"
                  stroke="rgba(121, 79, 39, 0.08)"
                  stroke-width="0.5"
                />
                <path
                  class="codex-cloud"
                  d="M16 6.5 C20 6.5, 23 9.5, 23 13.5 C25.5 13.5, 27.5 15.5, 27.5 18 C27.5 21, 25 23.5, 22 23.5 L10 23.5 C7 23.5, 4.5 21, 4.5 18 C4.5 15.5, 6.5 13.5, 9 13.5 C9 9.5, 12 6.5, 16 6.5 Z"
                  fill="url(#codexCloudGrad)"
                />
                <g class="char-wrapper-gt">
                  <path
                    class="char-gt"
                    d="M10.5 12 L14.5 15 L10.5 18"
                    stroke="#ffffff"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    fill="none"
                  />
                </g>
                <g class="char-wrapper-cursor">
                  <line
                    class="char-cursor"
                    x1="16.5"
                    y1="18"
                    x2="21.5"
                    y2="18"
                    stroke="#ffffff"
                    stroke-width="2.2"
                    stroke-linecap="round"
                  />
                </g>
              </svg>
              <!-- Gemini 双四角星 -->
              <svg v-else-if="agent.key === 'gemini'" viewBox="0 0 32 32" class="svg-gemini">
                <path
                  class="star-main"
                  d="M14 4 C14 10, 10 14, 4 14 C10 14, 14 18, 14 24 C14 18, 18 14, 24 14 C18 14, 14 10, 14 4 Z"
                  fill="url(#geminiGrad)"
                />
                <path
                  class="star-sub"
                  d="M24 20 C24 23, 23 24, 20 24 C23 24, 24 25, 24 28 C24 25, 25 24, 28 24 C25 24, 24 23, 24 20 Z"
                  fill="url(#geminiGradSmall)"
                />
              </svg>
              <!-- Claude 暖陶橙旋瓣标识 -->
              <svg v-else-if="agent.key === 'claude'" viewBox="0 0 24 24" class="svg-claude">
                <g class="claude-spin">
                  <g class="claude-bloom">
                    <path
                      class="claude-logo-path"
                      d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z"
                      fill="url(#claudePetalGrad)"
                    />
                  </g>
                </g>
              </svg>
            </div>
            <span>{{ agent.label }}</span>
            <el-icon v-if="agent.models.length > 1"><ArrowRight /></el-icon>
            <el-icon v-else-if="isAgentSelected(agent)"><Check /></el-icon>
          </button>
        </div>
        <div v-if="activeAgentWithChildren" class="report-model-select__submenu">
          <button
            v-for="model in activeAgentWithChildren.models"
            :key="model"
            type="button"
            class="report-model-select__model"
            :class="{ 'is-selected': config.model === model }"
            @click="selectModel(model)"
          >
            <span>{{ formatModelLabel(model) }}</span>
            <el-icon v-if="config.model === model"><Check /></el-icon>
          </button>
        </div>
      </div>

      <Button
        type="primary"
        size="small"
        :loading="exportButtonLoading"
        :disabled="isExportActive"
        @click="handleExport"
      >
        {{ isExportActive ? "生成中" : "导出报表" }}
      </Button>

      <Button type="default" size="small" @click="openExportHistory">导出列表</Button>

      <div class="import-group">
        <AnimalDatePicker
          v-model="config.importYear"
          type="year"
          placeholder="导入年份"
          value-format="YYYY"
          class="report-field-import"
          style="width: 120px !important"
        />
        <AnimalUpload accept=".md" @change="handleImport">
          <Button type="default" size="small">
            <SystemIco name="plus" :size="13" />
            导入 MD
          </Button>
        </AnimalUpload>
      </div>
    </div>
    <AdminAnimalModal
      v-model:visible="historyVisible"
      title="报表生成记录"
      width="70%"
      :show-footer="false"
      @close="handleHistoryClose"
    >
      <div class="export-history">
        <div class="export-history__toolbar">
          <span class="export-history__hint">
            仅显示当前用户最近的导出任务。生成中的记录每 5 秒自动刷新。
          </span>
          <Button type="default" size="small" :loading="historyLoading" @click="refreshHistory">
            刷新
          </Button>
        </div>
        <div v-if="historyLoading && !historyItems.length" class="export-history__empty">
          加载中...
        </div>
        <div v-else-if="!historyItems.length" class="export-history__empty">暂无生成记录</div>
        <table v-else class="export-history__table">
          <thead>
            <tr>
              <th>创建时间</th>
              <th>类型</th>
              <th>区间</th>
              <th>模型</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in historyItems" :key="item.id">
              <td>{{ formatTimestamp(item.createdAt) }}</td>
              <td>{{ formatExportType(item.type) }}</td>
              <td>{{ formatExportPeriod(item) }}</td>
              <td>{{ formatModelLabel(item.model || "") || "-" }}</td>
              <td>
                <span class="export-history__status" :class="`is-${item.status}`">
                  {{ formatStatus(item.status) }}
                </span>
              </td>
              <td>
                <div v-if="item.status === 'completed'" class="export-history__actions">
                  <Button type="primary" size="small" @click="handlePreviewItem(item)">
                    预览
                  </Button>
                  <Button type="default" size="small" @click="handleDownloadItem(item)">
                    下载
                  </Button>
                  <Button danger size="small" @click="handleDeleteItem(item)">
                    删除
                  </Button>
                </div>
                <span
                  v-else-if="item.status === 'failed'"
                  class="export-history__error"
                  :title="item.errorMessage || ''"
                >
                  {{ item.errorMessage || "失败（无详细信息）" }}
                </span>
                <span v-else class="export-history__pending">处理中...</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </AdminAnimalModal>

    <AdminAnimalModal
      v-model:visible="previewVisible"
      :title="previewTitle"
      width="880px"
      content-class="report-preview-content"
      @close="closePreview"
    >
      <div class="report-preview">
        <div v-if="previewLoading" class="report-preview__loading">渲染中...</div>
        <AnimalMarkdown
          v-else-if="previewMode === 'edit'"
          v-model="editContent"
          height="70vh"
        />
        <iframe
          v-else-if="previewUrl"
          ref="previewFrameRef"
          :src="previewUrl"
          class="report-preview__frame"
          title="报表预览"
        ></iframe>
      </div>
      <template #footer>
        <div class="report-preview__footer">
          <span class="report-preview__tip">
            {{
              previewMode === "edit"
                ? "编辑 Markdown 源，保存后预览/下载/打印都用新内容"
                : "打印时记得勾「背景图形」，配色才会进 PDF"
            }}
          </span>
          <div v-if="previewMode === 'edit'" class="report-preview__actions">
            <Button type="default" size="small" :disabled="savingEdit" @click="cancelEdit">
              取消
            </Button>
            <Button type="primary" size="small" :loading="savingEdit" @click="saveEdit">
              保存
            </Button>
          </div>
          <div v-else class="report-preview__actions">
            <Button type="default" size="small" @click="closePreview">关闭</Button>
            <Button type="default" size="small" :disabled="!previewItem" @click="enterEdit">
              编辑
            </Button>
            <Button type="default" size="small" :disabled="!previewItem" @click="downloadPreview">
              下载 HTML
            </Button>
            <Button type="primary" size="small" :disabled="!previewUrl" @click="printPreview">
              打印 / 存 PDF
            </Button>
          </div>
        </div>
      </template>
    </AdminAnimalModal>
  </div>
</template>

<script setup lang="ts">
import { confirm, message } from "@/utils/feedback";
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { type UploadFile } from "element-plus";
import { ArrowDown, ArrowRight, Check } from "@element-plus/icons-vue";
import { Button } from "animal-island-vue";
import AnimalSelect from "@/components/AnimalSelect/index.vue";
import { downloadFile } from "@/utils/download";
import AnimalDatePicker from "@/components/AnimalDatePicker/index.vue";
import AnimalUpload from "@/components/AnimalUpload/index.vue";
import SystemIco from "@/components/AdminPage/SystemIco.vue";
import AdminAnimalModal from "@/components/AdminPage/AdminAnimalModal.vue";
import AnimalMarkdown from "@/components/AnimalMarkdown/index.vue";
import WorkDailyAPI, { type WorkDailyReportExport } from "@/api/develop/work-daily";

const emit = defineEmits<{ imported: [] }>();

const creatingExport = ref(false);
const reportModels = ref<string[]>([]);
const modelMenuOpen = ref(false);
const activeAgentKey = ref("");
const modelSelectRef = ref<HTMLElement>();
const currentExport = ref<WorkDailyReportExport | null>(null);
let exportPollTimer: number | undefined;

const historyVisible = ref(false);
const historyLoading = ref(false);
const historyItems = ref<WorkDailyReportExport[]>([]);
let historyRefreshTimer: number | undefined;

const previewVisible = ref(false);
const previewLoading = ref(false);
const previewUrl = ref("");
const previewTitle = ref("报表预览");
const previewItem = ref<WorkDailyReportExport | null>(null);
const previewFrameRef = ref<HTMLIFrameElement | null>(null);
const previewMode = ref<"view" | "edit">("view");
const editContent = ref("");
const savingEdit = ref(false);

const config = reactive({
  type: "month" as "month" | "week" | "year",
  month: new Date().toISOString().substring(0, 7),
  weekRange: [] as string[],
  year: new Date().getFullYear().toString(),
  model: "",
  importYear: new Date().getFullYear().toString(),
});

const typeOptions = [
  { key: "month", label: "月报" },
  { key: "week", label: "周报" },
  { key: "year", label: "年报" },
];

interface ModelAgent {
  key: string;
  label: string;
  models: string[];
}

const modelAgents = computed<ModelAgent[]>(() => {
  const openClawModels = reportModels.value.filter(
    (model) => !isLocalCodexModel(model) && !isLocalGeminiModel(model) && !isLocalClaudeModel(model)
  );
  const codexModels = reportModels.value.filter(isLocalCodexModel);
  if (!codexModels.includes("local-codex/codex-cli")) {
    codexModels.push("local-codex/codex-cli");
  }
  const geminiModels = reportModels.value.filter(isLocalGeminiModel);
  if (!geminiModels.includes("local-gemini/gemini-cli")) {
    geminiModels.push("local-gemini/gemini-cli");
  }
  const claudeModels = reportModels.value.filter(isLocalClaudeModel);
  if (!claudeModels.includes("local-claude/claude-cli")) {
    claudeModels.push("local-claude/claude-cli");
  }
  const agents: ModelAgent[] = [];

  if (openClawModels.length) {
    agents.push({ key: "openclaw", label: "OpenClaw", models: openClawModels });
  }
  if (codexModels.length) {
    agents.push({ key: "codex", label: "Codex", models: codexModels });
  }
  if (geminiModels.length) {
    agents.push({ key: "gemini", label: "Gemini", models: geminiModels });
  }
  if (claudeModels.length) {
    agents.push({ key: "claude", label: "Claude", models: claudeModels });
  }

  return agents;
});

const activeAgentWithChildren = computed(() => {
  if (!modelMenuOpen.value) return null;
  const agent = modelAgents.value.find((item) => item.key === activeAgentKey.value);
  return agent && agent.models.length > 1 ? agent : null;
});

const selectedModelLabel = computed(() => {
  if (!config.model) return "AI模型";
  const agent = modelAgents.value.find((item) => item.models.includes(config.model));
  if (!agent) return config.model;
  return agent.models.length === 1
    ? agent.label
    : `${agent.label} / ${formatModelLabel(config.model)}`;
});

const selectedAgentKey = computed(() => {
  if (!config.model) return "";
  const agent = modelAgents.value.find((item) => item.models.includes(config.model));
  return agent ? agent.key : "";
});

const isExportActive = computed(() => {
  return currentExport.value ? ["pending", "running"].includes(currentExport.value.status) : false;
});

const exportButtonLoading = computed(() => creatingExport.value || isExportActive.value);

function isLocalCodexModel(model: string): boolean {
  return model.startsWith("local-codex/");
}

function isLocalGeminiModel(model: string): boolean {
  return model.startsWith("local-gemini/");
}

function isLocalClaudeModel(model: string): boolean {
  return model.startsWith("local-claude/");
}

function formatModelLabel(model: string): string {
  if (model === "local-codex/codex-cli") return "Codex CLI";
  if (model === "local-gemini/gemini-cli") return "Gemini CLI";
  if (model === "local-claude/claude-cli") return "Claude CLI";
  return model;
}

function isAgentSelected(agent: ModelAgent): boolean {
  return agent.models.length === 1 && config.model === agent.models[0];
}

function toggleModelMenu(): void {
  modelMenuOpen.value = !modelMenuOpen.value;
  if (modelMenuOpen.value) {
    const selectedAgent = modelAgents.value.find((agent) => agent.models.includes(config.model));
    activeAgentKey.value =
      selectedAgent?.key || modelAgents.value.find((agent) => agent.models.length > 1)?.key || "";
  }
}

function handleAgentClick(agent: ModelAgent): void {
  activeAgentKey.value = agent.key;
  if (agent.models.length === 1) {
    selectModel(agent.models[0]);
  }
}

function selectModel(model: string): void {
  config.model = model;
  modelMenuOpen.value = false;
}

function handleModelOutsideClick(event: MouseEvent): void {
  if (!modelSelectRef.value) return;
  if (modelSelectRef.value.contains(event.target as Node)) return;
  modelMenuOpen.value = false;
}

async function fetchModels(): Promise<void> {
  try {
    const res = await WorkDailyAPI.getReportModels();
    reportModels.value = res.models || [];
    if (res.currentModel) config.model = res.currentModel;
  } catch {
    reportModels.value = [];
  }
}

async function handleExport(): Promise<void> {
  if (config.type === "month" && !config.month) {
    message.warning("请选择月份");
    return;
  }
  if (config.type === "week" && (!config.weekRange || config.weekRange.length < 2)) {
    message.warning("请选择周范围");
    return;
  }
  if (config.type === "year" && !config.year) {
    message.warning("请选择年份");
    return;
  }

  creatingExport.value = true;
  try {
    const payload: {
      type: "month" | "week" | "year";
      month?: string;
      start_date?: string;
      end_date?: string;
      year?: string;
      model?: string;
    } = {
      type: config.type,
      model: config.model,
    };
    if (config.type === "month") {
      payload.month = config.month;
    } else if (config.type === "week") {
      payload.start_date = config.weekRange[0];
      payload.end_date = config.weekRange[1];
    } else {
      payload.year = config.year;
    }

    const result = await WorkDailyAPI.createReportExport(payload);
    currentExport.value = result.export;
    if (result.blocked) {
      message.warning("已有报表正在生成");
    } else {
      message.success("导出任务已创建");
    }
    startExportPolling(result.export.id, true);
  } catch {
    message.error("导出失败");
  } finally {
    creatingExport.value = false;
  }
}

async function fetchCurrentExport(): Promise<void> {
  const result = await WorkDailyAPI.getCurrentReportExport();
  currentExport.value = result.export;
  if (result.export && result.active) {
    startExportPolling(result.export.id, false);
  }
}

function startExportPolling(id: number, autoDownload: boolean): void {
  stopExportPolling();
  pollExport(id, autoDownload);
  exportPollTimer = window.setInterval(() => {
    pollExport(id, true);
  }, 3000);
}

function stopExportPolling(): void {
  if (exportPollTimer) {
    window.clearInterval(exportPollTimer);
    exportPollTimer = undefined;
  }
}

async function pollExport(id: number, autoDownload: boolean): Promise<void> {
  try {
    const result = await WorkDailyAPI.getReportExport(id);
    currentExport.value = result.export;
    if (!result.export || result.active) return;

    stopExportPolling();
    if (result.export.status === "completed") {
      if (autoDownload) {
        message.success("生成成功");
        await openPreview(result.export);
      }
      return;
    }

    message.error(result.export.errorMessage || "导出失败");
  } catch {
    stopExportPolling();
  }
}

async function downloadExport(exportItem: WorkDailyReportExport): Promise<void> {
  const response = await WorkDailyAPI.downloadReportExport(exportItem.id);
  downloadFile(response, exportItem.fileName.replace(/\.md$/, ".html"));
}

async function handleImport(file: UploadFile): Promise<void> {
  const raw = file.raw;
  if (!raw) return;
  try {
    await WorkDailyAPI.importMarkdown(raw, config.importYear);
    message.success("导入成功");
    emit("imported");
  } catch {
    message.error("导入失败");
  }
}

function openExportHistory(): void {
  historyVisible.value = true;
  refreshHistory();
}

function handleHistoryClose(): void {
  stopHistoryAutoRefresh();
}

async function refreshHistory(): Promise<void> {
  historyLoading.value = true;
  try {
    const result = await WorkDailyAPI.listReportExports({ page: 1, page_size: 20 });
    historyItems.value = result.items || [];
    const hasActive = historyItems.value.some(
      (item) => item.status === "pending" || item.status === "running"
    );
    if (hasActive && historyVisible.value) {
      startHistoryAutoRefresh();
    } else {
      stopHistoryAutoRefresh();
    }
  } catch {
    message.error("加载记录失败");
  } finally {
    historyLoading.value = false;
  }
}

function startHistoryAutoRefresh(): void {
  if (historyRefreshTimer) return;
  historyRefreshTimer = window.setInterval(() => {
    if (!historyVisible.value) {
      stopHistoryAutoRefresh();
      return;
    }
    refreshHistory();
  }, 5000);
}

function stopHistoryAutoRefresh(): void {
  if (historyRefreshTimer) {
    window.clearInterval(historyRefreshTimer);
    historyRefreshTimer = undefined;
  }
}

async function handleDownloadItem(item: WorkDailyReportExport): Promise<void> {
  try {
    await downloadExport(item);
  } catch {
    message.error("下载失败");
  }
}

function handleDeleteItem(item: WorkDailyReportExport): void {
  confirm("确认删除这条报表生成记录吗？", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    async () => {
      try {
        await WorkDailyAPI.deleteReportExport(item.id);
        message.success("删除成功");
        if (previewItem.value?.id === item.id) closePreview();
        await refreshHistory();
      } catch {
        message.error("删除失败");
      }
    },
    () => message.info("已取消删除")
  );
}

// 拉取带样式的 HTML（与下载/打印同一套渲染），用 blob 地址在 iframe 里预览，不触发下载
async function renderPreviewHtml(id: number): Promise<void> {
  previewLoading.value = true;
  revokePreviewUrl();
  try {
    const response = await WorkDailyAPI.downloadReportExport(id, "html");
    const blob = new Blob([response.data], { type: "text/html;charset=utf-8" });
    previewUrl.value = URL.createObjectURL(blob);
  } finally {
    previewLoading.value = false;
  }
}

async function openPreview(item: WorkDailyReportExport): Promise<void> {
  previewItem.value = item;
  previewTitle.value = item.fileName?.replace(/\.md$/, "") || "报表预览";
  previewMode.value = "view";
  previewVisible.value = true;
  await renderPreviewHtml(item.id);
}

// 进入编辑：取 Markdown 原文（复用 format=md 下载）填入编辑器
async function enterEdit(): Promise<void> {
  if (!previewItem.value) return;
  try {
    const response = await WorkDailyAPI.downloadReportExport(previewItem.value.id, "md");
    editContent.value =
      typeof response.data === "string" ? response.data : await response.data.text();
    previewMode.value = "edit";
  } catch {
    message.error("加载内容失败");
  }
}

function cancelEdit(): void {
  previewMode.value = "view";
  editContent.value = "";
}

// 保存：写回报表记录，再用新内容重渲染预览，回到查看模式
async function saveEdit(): Promise<void> {
  if (!previewItem.value) return;
  savingEdit.value = true;
  try {
    await WorkDailyAPI.updateReportExportContent(previewItem.value.id, editContent.value);
    message.success("已保存");
    previewMode.value = "view";
    editContent.value = "";
    await renderPreviewHtml(previewItem.value.id);
  } catch {
    message.error("保存失败");
  } finally {
    savingEdit.value = false;
  }
}

async function handlePreviewItem(item: WorkDailyReportExport): Promise<void> {
  try {
    await openPreview(item);
  } catch {
    previewVisible.value = false;
    message.error("预览失败");
  }
}

async function downloadPreview(): Promise<void> {
  if (!previewItem.value) return;
  try {
    await downloadExport(previewItem.value);
  } catch {
    message.error("下载失败");
  }
}

// 直接触发 iframe 自身文档的打印（blob 与主页面同源），只打印报表内容、走报表的 A4 打印样式；
// 若用浏览器 Cmd+P 会打印整个应用页面而非 iframe，所以必须从 iframe 内部触发
function printPreview(): void {
  const win = previewFrameRef.value?.contentWindow;
  if (!win) {
    message.error("预览未就绪，请稍候");
    return;
  }
  win.focus();
  win.print();
}

function revokePreviewUrl(): void {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = "";
  }
}

function closePreview(): void {
  previewVisible.value = false;
  revokePreviewUrl();
  previewItem.value = null;
  previewMode.value = "view";
  editContent.value = "";
}

function formatExportType(type: string): string {
  return ({ month: "月报", week: "周报", year: "年报" } as Record<string, string>)[type] || type;
}

function formatExportPeriod(item: WorkDailyReportExport): string {
  if (item.type === "month") return (item.periodStart || "").slice(0, 7);
  if (item.type === "year") return (item.periodStart || "").slice(0, 4);
  return `${item.periodStart || ""} ~ ${item.periodEnd || ""}`;
}

function formatStatus(status: string): string {
  return (
    (
      { pending: "排队中", running: "生成中", completed: "已完成", failed: "失败" } as Record<
        string,
        string
      >
    )[status] || status
  );
}

function formatTimestamp(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "" || value === 0) return "-";
  const d = typeof value === "number" ? new Date(value * 1000) : new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

onMounted(() => {
  fetchModels();
  fetchCurrentExport().catch(() => undefined);
  document.addEventListener("click", handleModelOutsideClick);
});

onBeforeUnmount(() => {
  stopExportPolling();
  stopHistoryAutoRefresh();
  revokePreviewUrl();
  document.removeEventListener("click", handleModelOutsideClick);
});
</script>

<style lang="scss" scoped>
/* 预览弹窗关掉外层 55vh 滚动容器，让 iframe 成为唯一滚动层，消除嵌套滚动闪烁 */
:deep(.admin-animal-modal__content.report-preview-content) {
  max-height: none;
  overflow: hidden;
  padding-right: 0;
}

.report-preview {
  height: 70vh;
  overscroll-behavior: contain;
}

.report-preview__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--ai-text-2, #9f927d);
  font-size: 13px;
}

.report-preview__frame {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 12px;
  background: #f6f1e7;
}

.report-preview__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.report-preview__tip {
  font-size: 12px;
  color: var(--ai-text-2, #9f927d);
}

.report-preview__actions {
  display: flex;
  gap: 8px;
}

.report-panel {
  margin-bottom: 16px;
  padding: 16px 18px;
  border-radius: 18px;
  border: 1.5px solid var(--ai-border, #e8e2d6);
  background:
    radial-gradient(circle at top right, rgba(172, 236, 109, 0.14), transparent 30%),
    rgba(255, 255, 255, 0.6);
}

.report-panel__head {
  margin-bottom: 12px;
}

.report-panel__title {
  font-size: 15px;
  font-weight: 800;
  color: var(--ai-text, #794f27);
}

.report-panel__desc {
  margin-top: 3px;
  font-size: 12px;
  color: var(--ai-text-2, #9f927d);
}

.report-panel__row {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 12px;
  overflow: visible;
  padding-bottom: 4px;
}

.import-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.export-history {
  font-size: 13px;
  color: var(--ai-text, #794f27);
}

.export-history__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.export-history__hint {
  font-size: 12px;
  color: var(--ai-text-2, #9f927d);
}

.export-history__empty {
  padding: 24px;
  text-align: center;
  color: var(--ai-text-2, #9f927d);
}

.export-history__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th,
  td {
    padding: 8px 10px;
    border-bottom: 1px dashed var(--ai-border, #e8e2d6);
    text-align: left;
    vertical-align: middle;
  }

  th {
    font-weight: 800;
    color: var(--ai-text-2, #9f927d);
    background: rgba(255, 252, 239, 0.6);
  }

  tbody tr:hover {
    background: rgba(25, 200, 185, 0.04);
  }
}

.export-history__status {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  background: rgba(159, 146, 125, 0.18);
  color: var(--ai-text-2, #9f927d);

  &.is-pending {
    background: rgba(255, 196, 87, 0.2);
    color: #c5832a;
  }

  &.is-running {
    background: rgba(25, 200, 185, 0.18);
    color: #11a89b;
  }

  &.is-completed {
    background: rgba(172, 236, 109, 0.32);
    color: #6a8b30;
  }

  &.is-failed {
    background: rgba(231, 96, 96, 0.18);
    color: #c44141;
  }
}

.export-history__error {
  display: inline-block;
  max-width: 280px;
  font-size: 12px;
  color: #c44141;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.export-history__pending {
  font-size: 12px;
  color: var(--ai-text-2, #9f927d);
}

.export-history__actions {
  display: inline-flex;
  align-items: center;
  gap: 14px;
}
</style>

<style lang="scss">
.report-panel {
  .report-field {
    width: 160px !important;
    flex-shrink: 0;
  }

  .report-field-wide {
    width: 240px !important;
    flex-shrink: 0;
  }

  /*
   * daterange 的 fallthrough class/style 落不到真正的 .el-range-editor 上
   * （而 .el-date-editor.animal-date{width:100%} 又把它撑满整行），
   * 所以用固定宽度 wrapper 兜住，让内部 editor 填满 240px wrapper。
   */
  .report-field-range-wrap {
    width: 280px;
    flex-shrink: 0;

    .el-date-editor.animal-date.el-range-editor {
      width: 100% !important;
    }
  }

  .report-field-model {
    width: 280px !important;
    flex-shrink: 0;
  }

  .report-field-import {
    width: 120px !important;
    flex-shrink: 0;
  }
}

.report-model-select {
  position: relative;
  width: 280px;
  flex-shrink: 0;
  font-family: inherit;

  &__trigger {
    width: 100%;
    height: 38px;
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 0 16px;
    border-radius: 18px;
    border: 2px solid var(--ai-border, #d8c9aa);
    background: rgba(255, 252, 239, 0.9);
    color: var(--ai-text, #794f27);
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 3px 0 0 var(--ai-shadow, #d4c9b4);
    transition:
      transform 0.18s ease,
      box-shadow 0.18s ease,
      border-color 0.18s ease;

    .el-icon {
      flex: 0 0 auto;
      font-size: 13px;
      color: var(--ai-text-2, #9f927d);
      transition: transform 0.18s ease;
    }

    &:hover,
    &.is-open {
      border-color: var(--ai-primary, #19c8b9);
      background: #fffdf4;
    }

    &.is-open {
      transform: translateY(2px);
      box-shadow: 0 1px 0 0 var(--ai-shadow, #d4c9b4);

      .el-icon {
        transform: rotate(180deg);
      }
    }
  }

  &__trigger-content {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    flex: 1;

    span {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__menu,
  &__submenu {
    position: absolute;
    z-index: 30;
    top: calc(100% + 8px);
    padding: 6px 0;
    border-radius: 20px;
    border: 2px solid var(--ai-border, #e8e2d6);
    background: #fdfbf7;
    box-shadow: 0 4px 16px rgba(121, 79, 39, 0.08);
  }

  &__menu {
    left: 0;
    width: 180px;
  }

  &__submenu {
    left: calc(180px + 8px);
    min-width: 200px;
    max-width: min(420px, calc(100vw - 40px));
    max-height: 320px;
    overflow-y: auto;
  }

  &__agent,
  &__model {
    position: relative;
    width: 100%;
    min-height: 36px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
    padding: 8px 16px;
    border: 0;
    border-radius: 0;
    background: transparent;
    color: var(--ai-text, #794f27);
    font-size: 13px;
    font-weight: 700;
    text-align: left;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s ease;

    span {
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .el-icon {
      margin-left: auto;
      flex: 0 0 auto;
      font-size: 13px;
      color: var(--ai-text-2, #9f927d);
      transition:
        color 0.2s ease,
        transform 0.2s ease;
    }

    /* 非选中态：hover 或 is-active（agent 子菜单展开时）显示手指与右移 */
    &:not(.is-selected):hover,
    &:not(.is-selected).is-active {
      background: rgba(25, 200, 185, 0.06);
      color: #11a89b;
      padding-left: 36px;

      .el-icon {
        color: #11a89b;
      }

      &::before {
        content: "";
        position: absolute;
        left: 6px;
        top: 50%;
        width: 18px;
        height: 18px;
        transform: translateY(-50%);
        background: url("../../../assets/select-cursor.svg") no-repeat center / contain;
        animation: animal-dropdown-cursor-in 0.3s ease-out forwards;
        pointer-events: none;
      }

      .agent-logo-wrapper {
        transform: scale(1.1);
        box-shadow: 0 2px 6px rgba(121, 79, 39, 0.15);
      }
    }

    /* 选中态：绿底深绿字，单层高亮，不出现手指 */
    &.is-selected {
      background: rgba(124, 186, 112, 0.1);
      color: #4a8a36;
      font-weight: 800;

      .el-icon {
        color: #4a8a36;
      }
    }
  }
}

/* ==========================================================================
   AI 代理 (Agent) SVG 动效 Logo 样式与微交互系统 (HSL High Aesthetics)
   ========================================================================== */
.agent-logo-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.85);
  box-shadow:
    inset 0 1px 2px rgba(0, 0, 0, 0.04),
    0 1px 2px rgba(121, 79, 39, 0.08);
  padding: 2.5px;
  box-sizing: border-box;
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid rgba(121, 79, 39, 0.06);

  &.mini {
    width: 20px;
    height: 20px;
    padding: 1.8px;
    background: rgba(255, 255, 255, 0.95);
  }

  // 自适应外框底色
  &.openclaw {
    background: #fff4f5;
    border-color: rgba(235, 65, 65, 0.15);
  }
  &.codex {
    background: #fbf5eb;
    border-color: rgba(142, 133, 255, 0.15);
  }
  &.gemini {
    background: #f0f4fc;
    border-color: rgba(66, 133, 244, 0.15);
  }
  &.claude {
    background: #fdf1ea;
    border-color: rgba(217, 119, 87, 0.18);
  }
}

.svg-openclaw,
.svg-codex,
.svg-gemini,
.svg-claude {
  width: 100%;
  height: 100%;
  overflow: visible;
  display: block;
}

/* ==========================================
   1. OpenClaw (图二红色吉祥物) 灵动动效
   ========================================== */
.svg-openclaw {
  filter: drop-shadow(0 0 2.5px rgba(235, 65, 65, 0.45));
  transition: filter 0.3s ease;

  // 1) 机器人整体呼吸慢速浮动
  .claw-robot-group {
    transform-origin: 16px 16.5px;
    animation: openclawFloat 2.8s ease-in-out infinite;
  }

  // 2) 天线高频信号微抖动
  .claw-antenna-l {
    transform-origin: 12.5px 10px;
    animation: antennaWiggleL 2s ease-in-out infinite alternate;
  }
  .claw-antenna-r {
    transform-origin: 19.5px 10px;
    animation: antennaWiggleR 2s ease-in-out infinite alternate;
  }

  // 3) 小胖手微幅常态摇摆，Hover 时大幅扇动
  .claw-hand-l {
    transform-origin: 9px 15.5px;
    animation: handFloatL 3s ease-in-out infinite alternate;
    transition: transform 0.25s cubic-bezier(0.25, 0.8, 0.25, 1.1);
  }
  .claw-hand-r {
    transform-origin: 23px 15.5px;
    animation: handFloatR 3s ease-in-out infinite alternate;
    transition: transform 0.25s cubic-bezier(0.25, 0.8, 0.25, 1.1);
  }

  // 4) 周期性眨眼
  .claw-eye-l,
  .claw-eye-r,
  .claw-eye-glow-l,
  .claw-eye-glow-r {
    transform-origin: 16px 14px;
    animation: eyeBlink 4.5s ease-in-out infinite;
  }
}

// 眨眼动画
@keyframes eyeBlink {
  0%,
  96%,
  100% {
    transform: scaleY(1);
  }
  98% {
    transform: scaleY(0.08);
  }
}

// 天线微摆动
@keyframes antennaWiggleL {
  0% {
    transform: rotate(-3deg);
  }
  100% {
    transform: rotate(5deg);
  }
}
@keyframes antennaWiggleR {
  0% {
    transform: rotate(3deg);
  }
  100% {
    transform: rotate(-5deg);
  }
}

// 常态双手漂浮
@keyframes handFloatL {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-6deg) translateY(-0.5px);
  }
}
@keyframes handFloatR {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(6deg) translateY(-0.5px);
  }
}

// 机器人呼吸浮动
@keyframes openclawFloat {
  0%,
  100% {
    transform: translateY(0.5px);
  }
  50% {
    transform: translateY(-1px);
  }
}

// 胖爪极速扇动 (加力交互)
@keyframes handWaveL {
  0%,
  100% {
    transform: rotate(-5deg);
  }
  50% {
    transform: rotate(20deg) scale(1.05);
  }
}
@keyframes handWaveR {
  0%,
  100% {
    transform: rotate(5deg);
  }
  50% {
    transform: rotate(-20deg) scale(1.05);
  }
}

// Hover/Active 吉祥物高光激活动画
.report-model-select__agent:hover,
.report-model-select__agent.is-active,
.report-model-select__trigger:hover {
  .svg-openclaw {
    filter: drop-shadow(0 0 4.5px rgba(235, 65, 65, 0.75));

    .claw-robot-group {
      animation: openclawFloat 1.5s ease-in-out infinite;
    }

    // 双爪做快乐的招手/扇动
    .claw-hand-l {
      animation: handWaveL 0.4s ease-in-out infinite alternate;
    }
    .claw-hand-r {
      animation: handWaveR 0.4s ease-in-out infinite alternate;
    }

    // 接收信号高频摇晃
    .claw-antenna-l {
      animation: antennaWiggleL 0.3s ease-in-out infinite alternate;
    }
    .claw-antenna-r {
      animation: antennaWiggleR 0.3s ease-in-out infinite alternate;
    }

    // 极速眨眼聚焦
    .claw-eye-l,
    .claw-eye-r,
    .claw-eye-glow-l,
    .claw-eye-glow-r {
      animation: eyeBlink 1.8s ease-in-out infinite;
    }
  }
}

/* ==========================================
   2. Codex (图一蓝紫命令云) 螺旋滑入动效
   ========================================== */
.svg-codex {
  .codex-cloud {
    transform-origin: 16px 15px;
    transition:
      transform 0.3s ease,
      filter 0.3s ease;
  }

  .char-wrapper-gt {
    transform-origin: 12.5px 14.5px;
  }

  .char-wrapper-cursor {
    transform-origin: 19px 17.5px;
  }

  .char-gt,
  .char-cursor {
    transition: transform 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
  }
}

// 转圈从外到内螺旋落入
@keyframes codexSpinGt {
  0% {
    transform: translate(-16px, -16px) rotate(-270deg) scale(2.4);
    opacity: 0;
  }
  75% {
    transform: translate(1px, 1px) rotate(15deg) scale(0.95);
    opacity: 0.8;
  }
  100% {
    transform: translate(0, 0) rotate(0deg) scale(1);
    opacity: 1;
  }
}

@keyframes codexSpinCursor {
  0% {
    transform: translate(16px, 16px) rotate(-180deg) scale(2.2);
    opacity: 0;
  }
  75% {
    transform: translate(-1px, -1px) rotate(-15deg) scale(0.95);
    opacity: 0.8;
  }
  100% {
    transform: translate(0, 0) rotate(0deg) scale(1);
    opacity: 1;
  }
}

@keyframes cloudPulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.96);
  }
}

// Hover/Active 激活命令由外到内旋转滑入
.report-model-select__agent:hover,
.report-model-select__agent.is-active,
.report-model-select__trigger:hover {
  .svg-codex {
    .codex-cloud {
      animation: cloudPulse 1.2s ease-in-out infinite alternate;
      filter: drop-shadow(0 2px 4px rgba(37, 69, 255, 0.25));
    }
    .char-gt {
      animation: codexSpinGt 0.75s cubic-bezier(0.25, 0.8, 0.25, 1.1) forwards;
    }
    .char-cursor {
      animation: codexSpinCursor 0.75s cubic-bezier(0.25, 0.8, 0.25, 1.1) 0.06s forwards;
    }
  }
}

/* ==========================================
   3. Gemini (交叉极光星芒) 动效 (保持原有高颜值)
   ========================================== */
.svg-gemini {
  .star-main {
    transform-origin: 14px 14px;
    animation: geminiStarBreath 2.8s ease-in-out infinite;
    transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .star-sub {
    transform-origin: 24px 24px;
    animation: geminiStarBreathSub 2.8s ease-in-out infinite;
    transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

@keyframes geminiStarBreath {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.95;
  }
  50% {
    transform: scale(1.06);
    opacity: 1;
  }
}

@keyframes geminiStarBreathSub {
  0%,
  100% {
    transform: scale(1.12);
    opacity: 1;
  }
  50% {
    transform: scale(0.88);
    opacity: 0.85;
  }
}

@keyframes geminiMainSpin {
  0% {
    transform: rotate(0deg) scale(1.12);
  }
  100% {
    transform: rotate(180deg) scale(1.12);
  }
}

@keyframes geminiSubSpin {
  0% {
    transform: rotate(0deg) scale(1.15);
  }
  100% {
    transform: rotate(-360deg) scale(1.15);
  }
}

.report-model-select__agent:hover,
.report-model-select__agent.is-active,
.report-model-select__trigger:hover {
  .svg-gemini {
    filter: drop-shadow(0 0 3px rgba(66, 133, 244, 0.35))
      drop-shadow(0 0 6px rgba(163, 118, 235, 0.2));

    .star-main {
      animation: geminiMainSpin 0.75s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
    }
    .star-sub {
      animation: geminiSubSpin 1.1s linear infinite;
    }
  }
}

/* ==========================================
   4. Claude (暖陶橙旋瓣标识) 动效
   ========================================== */
.svg-claude {
  filter: drop-shadow(0 0 1.5px rgba(217, 119, 87, 0.25));
  transition: filter 0.3s ease;

  .claude-spin,
  .claude-bloom {
    transform-origin: 12px 12px;
  }

  .claude-bloom {
    animation: claudeBreath 3.2s ease-in-out infinite;
  }

  .claude-logo-path {
    fill: url(#claudePetalGrad);
    transform-origin: 12px 12px;
    transition: fill 0.3s ease;
  }
}

@keyframes claudeBreath {
  0%,
  100% {
    transform: scale(0.90);
  }
  50% {
    transform: scale(1.10);
  }
}

.report-model-select__agent:hover,
.report-model-select__agent.is-active,
.report-model-select__trigger:hover {
  .svg-claude {
    filter: drop-shadow(0 0 3px rgba(217, 119, 87, 0.65))
      drop-shadow(0 0 8px rgba(240, 170, 130, 0.35));

    .claude-bloom {
      animation: claudeActivePulse 0.9s cubic-bezier(0.25, 0.8, 0.25, 1) infinite alternate;
    }
  }
}

@keyframes claudeActivePulse {
  0% {
    transform: scale(0.85);
  }
  100% {
    transform: scale(1.22);
  }
}
</style>
