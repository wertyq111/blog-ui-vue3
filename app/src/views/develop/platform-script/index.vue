<!-- 平台脚本：粘贴银行推送文本 -> 解析预览 -> 确认发送 -> 远端脚本执行结果 -->
<template>
  <div class="page-card">
    <div class="page-head">
      <div class="page-eyebrow">DEVELOP WORKSPACE</div>
      <h1 class="page-title">平台脚本</h1>
      <p class="page-desc">粘贴银行方发来的推送文本，自动解析参数并生成自增订单号，确认后驱动远端脚本执行并返回报文。</p>
    </div>

    <!-- 执行区 -->
    <div class="list-card">
      <div class="list-head">
        <div>
          <div class="list-title">推送执行</div>
          <div class="list-sub">选择脚本并粘贴推送文本，先解析预览核对，再确认发送到远端。</div>
        </div>
      </div>

      <div class="filter-bar">
        <div class="filter-field">
          <label class="filter-label">脚本：</label>
          <el-select v-model="scriptKey" class="filter-select" style="width: 260px">
            <el-option
              v-for="opt in scriptOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </div>
      </div>

      <div class="ps-field">
        <div class="ps-field__label">推送文本</div>
        <el-input
          v-model="inputText"
          type="textarea"
          :rows="8"
          :placeholder="placeholder"
        />
      </div>

      <div class="toolbar">
        <Button type="primary" size="small" :disabled="previewing" @click="handlePreview">
          <SystemIco name="search" :size="13" />
          解析预览
        </Button>
        <Button type="default" size="small" @click="handleClear">清空</Button>
      </div>

      <!-- 预览 -->
      <div v-if="previewData" class="ps-panel ps-panel--preview">
        <div class="ps-panel__title">
          <SystemIco name="edit" :size="13" />
          解析结果（核对无误后确认发送）
        </div>
        <div class="ps-grid">
          <div v-for="def in fieldDefs" :key="def.key" class="ps-grid__item">
            <span class="ps-grid__label">{{ def.label }}</span>
            <span class="ps-grid__value cell-mono">{{ previewData.fields[def.key] }}</span>
          </div>
          <div class="ps-grid__item ps-grid__item--ordr">
            <span class="ps-grid__label">订单号 ordrNo（自增）</span>
            <span class="ps-grid__value cell-mono">{{ previewData.ordr_no }}</span>
          </div>
        </div>
        <div class="ps-panel__footer">
          <Button type="primary" size="small" :disabled="running" @click="handleConfirmSend">
            确认发送
          </Button>
          <Button type="default" size="small" @click="previewData = null">取消</Button>
        </div>
      </div>

      <!-- 执行结果 -->
      <div v-if="result" class="ps-panel ps-panel--result">
        <div class="ps-panel__title">
          <el-tag :type="statusMeta(result.status).type" size="small">
            {{ statusMeta(result.status).text }}
          </el-tag>
          <span class="ps-result-ordr cell-mono">订单号：{{ result.ordrNo }}</span>
          <Button v-if="result.output" type="default" size="small" @click="copyOutput">复制输出</Button>
        </div>
        <div v-if="result.error" class="ps-error">{{ result.error }}</div>
        <el-input
          :model-value="result.output || '（无输出）'"
          type="textarea"
          :rows="12"
          readonly
          class="ps-output"
        />
      </div>
    </div>

    <!-- 历史记录 -->
    <div class="list-card">
      <div class="list-head">
        <div>
          <div class="list-title">执行记录</div>
          <div class="list-sub">每次发送都会存档，订单号按脚本历史最大值自增。</div>
        </div>
      </div>

      <div class="filter-bar">
        <div class="filter-field">
          <label class="filter-label">申请编号：</label>
          <Input
            v-model="queryParams.appl_id"
            class="filter-input"
            placeholder="请输入申请编号"
            allow-clear
            @keyup.enter="handleQuery"
          />
        </div>
        <Button type="primary" size="small" @click="handleQuery">
          <SystemIco name="search" :size="13" />
          查询
        </Button>
        <Button type="default" size="small" @click="handleResetQuery">重置</Button>
      </div>

      <div v-loading="loading" class="tbl-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th style="width: 70px">ID</th>
              <th style="width: 210px">订单号</th>
              <th style="width: 210px">申请编号</th>
              <th>交易对手户名</th>
              <th style="width: 90px">状态</th>
              <th style="width: 160px">时间</th>
              <th style="width: 90px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in dataList" :key="row.id">
              <td class="cell-num">{{ row.id }}</td>
              <td class="cell-mono">{{ row.ordrNo }}</td>
              <td class="cell-mono">{{ row.applId }}</td>
              <td>{{ row.cntprNme }}</td>
              <td>
                <el-tag :type="statusMeta(row.status).type" size="small">
                  {{ statusMeta(row.status).text }}
                </el-tag>
              </td>
              <td class="cell-mono">{{ row.createTime }}</td>
              <td>
                <span class="tbl-actions">
                  <span class="action-link act-edit" @click="handleViewOutput(row)">
                    <SystemIco name="search" :size="12" />
                    查看
                  </span>
                </span>
              </td>
            </tr>
            <tr v-if="!loading && dataList.length === 0" class="empty-row">
              <td colspan="7">暂无数据</td>
            </tr>
          </tbody>
        </table>
      </div>

      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="fetchList"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { confirm, message } from "@/utils/feedback";
import { onMounted, reactive, ref } from "vue";
import { useClipboard } from "@vueuse/core";

import { Button, Input } from "animal-island-vue";
import SystemIco from "@/components/AdminPage/SystemIco.vue";
import PlatformScriptAPI from "@/api/develop/platform-script";
import type {
  PlatformScriptFields,
  PlatformScriptPreview,
  PlatformScriptQueryParams,
  PlatformScriptRunItem,
} from "@/types/api/platform-script";

defineOptions({ name: "PlatformScript", inheritAttrs: false });

const scriptOptions = [
  { value: "sinoloans-comm3-loan", label: "sinoloans 交行个经贷放款测试推送" },
];

/** 执行状态对应的标签样式与文案 */
function statusMeta(status: string): { type: "success" | "warning" | "danger"; text: string } {
  if (status === "success") return { type: "success", text: "已执行" };
  if (status === "timeout") return { type: "warning", text: "执行超时" };
  return { type: "danger", text: "执行失败" };
}

const fieldDefs: { key: keyof PlatformScriptFields; label: string }[] = [
  { key: "appl_id", label: "申请编号" },
  { key: "cntrct_no", label: "合同号" },
  { key: "cust_pay_amt", label: "提款金额" },
  { key: "cntpr_nme", label: "交易对手户名" },
  { key: "cust_bank_acct_no", label: "收款银行账户" },
  { key: "actcpe_bchnw_id", label: "开户网点号" },
  { key: "actope_bchnw_nme", label: "开户网点名" },
];

const placeholder = [
  "申请编号:SYBG5231803687502921728",
  "收款银行账户:6222620110099748528",
  "合同号: 202901331160999077200000001",
  "提款金额:10000",
  "交易对手户名:王瑾诗",
  "开户网点号: 01310207999",
  "开户网点名:交通银行上海陕西南路支行",
].join("\n");

const scriptKey = ref(scriptOptions[0].value);
const inputText = ref("");
const previewData = ref<PlatformScriptPreview | null>(null);
const result = ref<PlatformScriptRunItem | null>(null);
const previewing = ref(false);
const running = ref(false);

const { copy, isSupported } = useClipboard({ legacy: true });

const queryParams = reactive<PlatformScriptQueryParams>({
  pageNum: 1,
  pageSize: 10,
  appl_id: "",
});
const loading = ref(false);
const total = ref(0);
const dataList = ref<PlatformScriptRunItem[]>([]);

async function handlePreview(): Promise<void> {
  if (!inputText.value.trim()) {
    message.warning("请先粘贴推送文本");
    return;
  }
  previewing.value = true;
  result.value = null;
  try {
    previewData.value = await PlatformScriptAPI.preview(scriptKey.value, inputText.value);
  } catch {
    // 错误信息已由请求拦截器统一提示
    previewData.value = null;
  } finally {
    previewing.value = false;
  }
}

function handleConfirmSend(): void {
  if (!previewData.value) return;
  const ordrNo = previewData.value.ordr_no;

  confirm(`确认以订单号 ${ordrNo} 发送到远端执行吗？此操作会真实推送到银行测试网关。`, "确认发送", {
    confirmButtonText: "确认发送",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => {
      running.value = true;
      PlatformScriptAPI.run(scriptKey.value, inputText.value)
        .then((run) => {
          result.value = run;
          previewData.value = null;
          if (run.status === "success") {
            message.success("已执行，请查看返回报文");
          } else if (run.status === "timeout") {
            message.warning(run.error || "远端执行超时，无法确认是否已送达");
          } else {
            message.error(run.error || "执行失败");
          }
          fetchList();
        })
        .catch(() => {
          // 错误信息已由请求拦截器统一提示
        })
        .finally(() => {
          running.value = false;
        });
    },
    () => {}
  );
}

function handleClear(): void {
  inputText.value = "";
  previewData.value = null;
  result.value = null;
}

async function copyOutput(): Promise<void> {
  if (!result.value?.output) return;
  if (!isSupported.value) {
    message.error("当前环境不支持自动复制，请手动选择复制");
    return;
  }
  try {
    await copy(result.value.output);
    message.success("已复制到剪贴板");
  } catch {
    message.error("复制失败");
  }
}

function handleViewOutput(row: PlatformScriptRunItem): void {
  result.value = row;
}

async function fetchList(): Promise<void> {
  loading.value = true;
  try {
    const data = await PlatformScriptAPI.getPage(queryParams);
    dataList.value = data.list;
    total.value = data.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleQuery(): void {
  queryParams.pageNum = 1;
  fetchList();
}

function handleResetQuery(): void {
  queryParams.appl_id = "";
  handleQuery();
}

onMounted(fetchList);
</script>

<style lang="scss" scoped>
.ps-field {
  margin: 8px 0 12px;
}

.ps-field__label {
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 700;
  color: var(--ai-text, #794f27);
}

.ps-panel {
  margin-top: 16px;
  padding: 16px;
  border-radius: 16px;
  border: 2px dashed rgba(74, 138, 54, 0.25);
  background: rgba(247, 251, 243, 0.6);
}

.ps-panel--result {
  border-color: rgba(64, 120, 200, 0.28);
  background: rgba(243, 247, 252, 0.7);
}

.ps-panel__title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 700;
  color: var(--ai-text, #794f27);
}

.ps-result-ordr {
  font-weight: 600;
}

.ps-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 20px;
}

.ps-grid__item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.ps-grid__item--ordr {
  grid-column: 1 / -1;
}

.ps-grid__label {
  font-size: 12px;
  color: rgba(121, 79, 39, 0.65);
}

.ps-grid__value {
  font-size: 13px;
  word-break: break-all;
}

.ps-grid__item--ordr .ps-grid__value {
  font-weight: 700;
  color: #c0662b;
}

.ps-panel__footer {
  display: flex;
  gap: 8px;
  margin-top: 14px;
}

.ps-error {
  margin-bottom: 10px;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(220, 80, 80, 0.1);
  color: #c0392b;
  font-size: 13px;
  word-break: break-all;
}

.ps-output {
  :deep(textarea) {
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
    font-size: 12px;
  }
}
</style>
