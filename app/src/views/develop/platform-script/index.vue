<!-- 平台脚本：支持多种平台脚本（交行放款推送、ChemNet 验证码手机号修改等） -->
<template>
  <div class="page-card">
    <div class="page-head">
      <div class="page-eyebrow">DEVELOP WORKSPACE</div>
      <h1 class="page-title">平台脚本</h1>
      <p class="page-desc">平台运维与测试脚本工具集：包含银行推送自动化、ChemNet 数据库凭据管理与状态修改。</p>
    </div>

    <!-- 执行区 -->
    <div ref="execCardRef" class="list-card">
      <div class="list-head">
        <div>
          <div class="list-title">脚本操作</div>
          <div class="list-sub">选择对应的业务脚本，输入参数进行查询预览与执行修改。</div>
        </div>
      </div>

      <div class="filter-bar">
        <div class="filter-field">
          <label class="filter-label">脚本：</label>
          <el-select v-model="scriptKey" class="filter-select" style="width: 360px" @change="handleScriptChange">
            <el-option
              v-for="opt in scriptOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </div>
      </div>

      <!-- 脚本 1：Sinoloans 交行放款推送 -->
      <template v-if="scriptKey === 'sinoloans-comm3-loan'">
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
          <Button type="primary" size="small" :disabled="previewing" @click="handlePreviewSinoloans">
            <SystemIco name="search" :size="13" />
            解析预览
          </Button>
          <Button type="default" size="small" @click="handleClearSinoloans">清空</Button>
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
            <Button type="primary" size="small" :disabled="running" @click="handleConfirmSendSinoloans">
              确认发送
            </Button>
            <Button type="default" size="small" @click="previewData = null">取消</Button>
          </div>
        </div>
      </template>

      <!-- 脚本 2：ChemNet 验证码手机号修改 -->
      <template v-else-if="scriptKey === 'chemnet-secret-code'">
        <div class="filter-bar" style="margin-top: 12px">
          <div class="filter-field">
            <label class="filter-label">账号 (login)：</label>
            <Input
              v-model="chemnetLogin"
              class="filter-input"
              style="width: 280px"
              placeholder="请输入账号 login (如 tianjibio123)"
              allow-clear
              @keyup.enter="handleQueryChemnet"
            />
          </div>
          <Button type="primary" size="small" :disabled="previewing" @click="handleQueryChemnet">
            <SystemIco name="search" :size="13" />
            查询账号信息
          </Button>
          <Button type="default" size="small" @click="handleClearChemnet">清空</Button>
        </div>

        <!-- 查询结果展示 -->
        <div v-if="chemnetQueryResult" class="ps-panel ps-panel--preview">
          <div class="ps-panel__title">
            <SystemIco name="edit" :size="13" />
            账号查询结果（数据表：hub_chinachemnet.secret_code）
          </div>

          <div v-if="!chemnetQueryResult.found" class="ps-empty-tip">
            未找到账号 <span class="cell-mono font-bold">{{ chemnetQueryResult.login }}</span> 的相关记录。
          </div>

          <template v-else-if="chemnetQueryResult.record">
            <div class="ps-grid">
              <div class="ps-grid__item">
                <span class="ps-grid__label">账号 (login)</span>
                <span class="ps-grid__value cell-mono font-bold">{{ chemnetQueryResult.record.login }}</span>
              </div>
              <div class="ps-grid__item">
                <span class="ps-grid__label">当前手机号 (mobile)</span>
                <span class="ps-grid__value cell-mono ps-highlight-mobile">{{ chemnetQueryResult.record.mobile }}</span>
              </div>
              <div class="ps-grid__item">
                <span class="ps-grid__label">最新验证码 (code)</span>
                <span class="ps-grid__value cell-mono">{{ chemnetQueryResult.record.code || '（空）' }}</span>
              </div>
              <div class="ps-grid__item">
                <span class="ps-grid__label">记录 ID</span>
                <span class="ps-grid__value cell-mono">{{ chemnetQueryResult.record.id }}</span>
              </div>
              <div class="ps-grid__item">
                <span class="ps-grid__label">发送时间 (post_time)</span>
                <span class="ps-grid__value cell-mono">{{ chemnetQueryResult.record.post_time }}</span>
              </div>
              <div class="ps-grid__item">
                <span class="ps-grid__label">来源 IP (post_ip)</span>
                <span class="ps-grid__value cell-mono">{{ chemnetQueryResult.record.post_ip || '（无）' }}</span>
              </div>
            </div>

            <!-- 修改手机号表单 -->
            <div class="ps-edit-box">
              <div class="ps-edit-box__title">修改手机号</div>
              <div class="ps-edit-box__form">
                <div class="filter-field">
                  <label class="filter-label">新手机号：</label>
                  <Input
                    v-model="chemnetNewMobile"
                    class="filter-input"
                    style="width: 240px"
                    placeholder="请输入 11 位新手机号"
                    allow-clear
                    @keyup.enter="handleConfirmUpdateChemnet"
                  />
                </div>
                <Button type="primary" size="small" :disabled="running" @click="handleConfirmUpdateChemnet">
                  <SystemIco name="edit" :size="13" />
                  确认修改手机号
                </Button>
              </div>
            </div>
          </template>
        </div>
      </template>

      <!-- 脚本 3：Bankofsun 交行企业贷 2.0 自动化流转 -->
      <template v-else-if="scriptKey === 'bankofsun-comm2-credit'">
        <div class="ps-field">
          <div class="ps-field__label">企业及授信申请文本</div>
          <el-input
            v-model="bankofsunText"
            type="textarea"
            :rows="8"
            :placeholder="bankofsunPlaceholder"
          />
        </div>

        <div class="toolbar">
          <Button type="primary" size="small" :disabled="previewing" @click="handlePreviewBankofsun">
            <SystemIco name="search" :size="13" />
            解析与匹配预览
          </Button>
          <Button type="default" size="small" @click="handleFillSampleBankofsun">填入测试示例</Button>
          <Button type="default" size="small" @click="handleClearBankofsun">清空</Button>
        </div>

        <!-- 预览面板 -->
        <div v-if="bankofsunPreviewData" class="ps-panel ps-panel--preview">
          <div class="ps-panel__title">
            <SystemIco name="edit" :size="13" />
            企业信息解析与建档匹配（核对无误后一键自动流转至阶段三）
          </div>

          <!-- 匹配状态指示 -->
          <div class="ps-match-status" :class="bankofsunPreviewData.matched ? 'ps-match-status--found' : 'ps-match-status--new'">
            <el-tag :type="bankofsunPreviewData.matched ? 'success' : 'warning'" size="small">
              {{ bankofsunPreviewData.matched ? '已在平台建档' : '未在平台建档' }}
            </el-tag>
            <span class="ps-match-tip">
              {{ bankofsunPreviewData.matched
                ? `匹配成功 (企业 CID: ${bankofsunPreviewData.company_data?.cid || '-'})，流转时将自动更新企业及补充资料`
                : '未检索到该企业档案，流转时将自动在平台创建新企业档案与补充材料'
              }}
            </span>
          </div>

          <div class="ps-grid">
            <div v-for="def in bankofsunFieldDefs" :key="def.key" class="ps-grid__item">
              <span class="ps-grid__label">{{ def.label }}</span>
              <span class="ps-grid__value cell-mono">
                {{ bankofsunPreviewData.fields[def.key] !== undefined && bankofsunPreviewData.fields[def.key] !== ''
                  ? bankofsunPreviewData.fields[def.key]
                  : '（未填写/默认）'
                }}
              </span>
            </div>
            <div class="ps-grid__item ps-grid__item--ordr">
              <span class="ps-grid__label">订单号 / 流水号 ordrNo（自增）</span>
              <span class="ps-grid__value cell-mono">{{ bankofsunPreviewData.ordr_no }}</span>
            </div>
          </div>

          <div class="ps-panel__footer">
            <Button type="primary" size="small" :disabled="running" @click="handleConfirmRunBankofsun">
              <SystemIco name="save" :size="13" />
              一键执行流转（阶段一至阶段三）
            </Button>
            <Button type="default" size="small" @click="bankofsunPreviewData = null">取消</Button>
          </div>
        </div>
      </template>

      <!-- 执行结果 -->
      <div v-if="result" class="ps-panel ps-panel--result">
        <div class="ps-panel__title">
          <el-tag :type="statusMeta(result.status).type" size="small">
            {{ statusMeta(result.status).text }}
          </el-tag>
          <span class="ps-result-ordr cell-mono">流水号：{{ result.ordrNo }}</span>
          <Button v-if="result.output" type="default" size="small" @click="copyOutput">复制输出</Button>
        </div>
        <div v-if="result.error" class="ps-error">{{ result.error }}</div>
        <el-input
          :model-value="result.output || '（无输出）'"
          type="textarea"
          :rows="8"
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
          <div class="list-sub">每次发送与修改操作均会自动存档留痕。</div>
        </div>
      </div>

      <div class="filter-bar">
        <div class="filter-field">
          <label class="filter-label">搜索条件：</label>
          <Input
            v-model="queryParams.appl_id"
            class="filter-input"
            placeholder="请输入申请编号 / 账号"
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
              <th style="width: 170px">流水/订单号</th>
              <th style="width: 130px">脚本类型</th>
              <th style="width: 200px">申请编号 / 账号</th>
              <th>详情 / 手机号</th>
              <th style="width: 90px">状态</th>
              <th style="width: 160px">时间</th>
              <th style="width: 90px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in dataList" :key="row.id">
              <td class="cell-num">{{ row.id }}</td>
              <td class="cell-mono">{{ row.ordrNo }}</td>
              <td>
                <el-tag size="small" :type="row.scriptKey === 'chemnet-secret-code' ? 'info' : 'primary'">
                  {{ formatScriptKey(row.scriptKey) }}
                </el-tag>
              </td>
              <td class="cell-mono font-bold">{{ row.applId }}</td>
              <td>{{ formatRecordDetail(row) }}</td>
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
              <td colspan="8">暂无数据</td>
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
  BankofsunComm2CreditFields,
  BankofsunComm2PreviewResult,
  ChemnetPreviewResult,
  PlatformScriptFields,
  PlatformScriptQueryParams,
  PlatformScriptRunItem,
} from "@/types/api/platform-script";

defineOptions({ name: "PlatformScript", inheritAttrs: false });

const scriptOptions = [
  { value: "sinoloans-comm3-loan", label: "sinoloans 交行个经贷放款测试推送" },
  { value: "chemnet-secret-code", label: "ChemNet 验证码手机号修改 (hub_chinachemnet.secret_code)" },
  { value: "bankofsun-comm2-credit", label: "bankofsun 交行企业贷2.0授信测试数据生成" },
];

/** 执行状态对应的标签样式与文案 */
function statusMeta(status: string): { type: "success" | "warning" | "danger"; text: string } {
  if (status === "success") return { type: "success", text: "已执行" };
  if (status === "timeout") return { type: "warning", text: "执行超时" };
  return { type: "danger", text: "执行失败" };
}

function formatScriptKey(key: string): string {
  if (key === "chemnet-secret-code") return "ChemNet 手机号";
  if (key === "sinoloans-comm3-loan") return "交行放款";
  if (key === "bankofsun-comm2-credit") return "交行企业贷 2.0";
  return key;
}

function formatRecordDetail(row: PlatformScriptRunItem): string {
  if (row.scriptKey === "chemnet-secret-code") {
    return row.custBankAcctNo ? `修改手机: ${row.custBankAcctNo}` : (row.rawText || "-");
  }
  if (row.scriptKey === "bankofsun-comm2-credit") {
    return row.custBankAcctNo ? `税号: ${row.custBankAcctNo}` : (row.rawText || "-");
  }
  return row.cntprNme ? `对手: ${row.cntprNme}` : (row.rawText || "-");
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

const bankofsunFieldDefs: { key: keyof BankofsunComm2CreditFields; label: string }[] = [
  { key: "company", label: "企业全称" },
  { key: "social_credit_code", label: "统一社会信用代码" },
  { key: "legal", label: "法人姓名" },
  { key: "id_card", label: "法人身份证号" },
  { key: "mobile", label: "手机号" },
  { key: "buyer_company_type", label: "企业类型" },
  { key: "trade_amount", label: "近两年平均交易量 (万元)" },
  { key: "loan_cardno", label: "对公客户号 / 贷款卡号" },
  { key: "amount", label: "申请额度 (分)" },
  { key: "ecif_cst_no", label: "法人客户号" },
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

const bankofsunPlaceholder = [
  "企业名称: 起起落落测试公司八",
  "统一社会信用代码: 9144080021832648A3",
  "法人姓名: 王五",
  "法人身份证号: 350623198711261343",
  "手机号: 13800000000",
  "企业类型: 贸易型企业",
  "近两年平均交易量: 5000",
  "对公客户号: 0115687030449558",
  "申请额度: 60000000",
].join("\n");

const scriptKey = ref(scriptOptions[0].value);

// Sinoloans 表单状态
const inputText = ref("");
const previewData = ref<any>(null);

// ChemNet 表单状态
const chemnetLogin = ref("");
const chemnetNewMobile = ref("");
const chemnetQueryResult = ref<ChemnetPreviewResult | null>(null);

// Bankofsun 企业贷 2.0 表单状态
const bankofsunText = ref("");
const bankofsunPreviewData = ref<BankofsunComm2PreviewResult | null>(null);

const result = ref<PlatformScriptRunItem | null>(null);
const execCardRef = ref<HTMLElement>();
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

function handleScriptChange(): void {
  previewData.value = null;
  chemnetQueryResult.value = null;
  bankofsunPreviewData.value = null;
  result.value = null;
}

/* ================= Sinoloans 操作 ================= */

async function handlePreviewSinoloans(): Promise<void> {
  if (!inputText.value.trim()) {
    message.warning("请先粘贴推送文本");
    return;
  }
  previewing.value = true;
  result.value = null;
  try {
    previewData.value = await PlatformScriptAPI.preview(scriptKey.value, { text: inputText.value });
  } catch {
    previewData.value = null;
  } finally {
    previewing.value = false;
  }
}

function handleConfirmSendSinoloans(): void {
  if (!previewData.value) return;
  const ordrNo = previewData.value.ordr_no;

  confirm(`确认以订单号 ${ordrNo} 发送到远端执行吗？此操作会真实推送到银行测试网关。`, "确认发送", {
    confirmButtonText: "确认发送",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => {
      running.value = true;
      PlatformScriptAPI.run(scriptKey.value, { text: inputText.value })
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
        .finally(() => {
          running.value = false;
        });
    },
    () => {}
  );
}

function handleClearSinoloans(): void {
  inputText.value = "";
  previewData.value = null;
  result.value = null;
}

/* ================= ChemNet 操作 ================= */

async function handleQueryChemnet(): Promise<void> {
  if (!chemnetLogin.value.trim()) {
    message.warning("请输入要查询的账号 (login)");
    return;
  }
  previewing.value = true;
  result.value = null;
  try {
    const res = await PlatformScriptAPI.preview(scriptKey.value, { login: chemnetLogin.value.trim() });
    chemnetQueryResult.value = res;
    if (res.found && res.record) {
      chemnetNewMobile.value = res.record.mobile || "";
      message.success(`已查询到账号 [${res.login}] 的信息`);
    } else {
      message.warning(`未找到账号 [${res.login}] 的记录`);
    }
  } catch {
    chemnetQueryResult.value = null;
  } finally {
    previewing.value = false;
  }
}

function handleConfirmUpdateChemnet(): void {
  const login = chemnetLogin.value.trim();
  const newMobile = chemnetNewMobile.value.trim();

  if (!login) {
    message.warning("请输入账号 (login)");
    return;
  }
  if (!newMobile || !/^1\d{10}$/.test(newMobile)) {
    message.warning("请输入合法的 11 位新手机号码");
    return;
  }

  const currentMobile = chemnetQueryResult.value?.record?.mobile || "未知";

  confirm(
    `确认将账号【${login}】的手机号码从【${currentMobile}】修改为【${newMobile}】吗？`,
    "确认修改手机号",
    {
      confirmButtonText: "确认修改",
      cancelButtonText: "取消",
      type: "warning",
    }
  ).then(
    () => {
      running.value = true;
      PlatformScriptAPI.run(scriptKey.value, { login, mobile: newMobile })
        .then((run) => {
          result.value = run;
          if (run.status === "success") {
            message.success(`账号 [${login}] 手机号已成功更新为 [${newMobile}]`);
            // 重新查询刷新界面
            handleQueryChemnet();
          } else {
            message.error(run.error || "修改失败");
          }
          fetchList();
        })
        .finally(() => {
          running.value = false;
        });
    },
    () => {}
  );
}

function handleClearChemnet(): void {
  chemnetLogin.value = "";
  chemnetNewMobile.value = "";
  chemnetQueryResult.value = null;
  result.value = null;
}

/* ================= Bankofsun 交行企业贷 2.0 操作 ================= */

async function handlePreviewBankofsun(): Promise<void> {
  if (!bankofsunText.value.trim()) {
    message.warning("请先粘贴企业及授信申请文本");
    return;
  }
  previewing.value = true;
  result.value = null;
  try {
    const res = await PlatformScriptAPI.preview(scriptKey.value, { text: bankofsunText.value });
    bankofsunPreviewData.value = res;
    if (res.matched) {
      message.success(`已检索到平台企业档案 (CID: ${res.company_data?.cid || '-'})`);
    } else {
      message.info("未匹配到企业，执行时将自动创建档案");
    }
  } catch {
    bankofsunPreviewData.value = null;
  } finally {
    previewing.value = false;
  }
}

function handleFillSampleBankofsun(): void {
  bankofsunText.value = bankofsunPlaceholder;
  bankofsunPreviewData.value = null;
  result.value = null;
  message.success("已填入测试企业数据示例");
}

function handleClearBankofsun(): void {
  bankofsunText.value = "";
  bankofsunPreviewData.value = null;
  result.value = null;
}

function handleConfirmRunBankofsun(): void {
  if (!bankofsunPreviewData.value) return;
  const companyName = bankofsunPreviewData.value.fields.company;
  const ordrNo = bankofsunPreviewData.value.ordr_no;

  confirm(
    `确认对企业【${companyName}】一键执行阶段一至阶段三自动流转吗？（流水号：${ordrNo}）`,
    "确认执行流转",
    {
      confirmButtonText: "确认执行",
      cancelButtonText: "取消",
      type: "warning",
    }
  ).then(
    () => {
      running.value = true;
      PlatformScriptAPI.run(scriptKey.value, { text: bankofsunText.value })
        .then((run) => {
          result.value = run;
          bankofsunPreviewData.value = null;
          if (run.status === "success") {
            message.success(`企业【${companyName}】授信数据已成功生成并达成阶段三！`);
          } else {
            message.error(run.error || "执行流转失败");
          }
          fetchList();
        })
        .finally(() => {
          running.value = false;
        });
    },
    () => {}
  );
}

/* ================= 通用操作与历史记录 ================= */

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
  if (row.scriptKey === "chemnet-secret-code") {
    scriptKey.value = "chemnet-secret-code";
    chemnetLogin.value = row.applId;
    chemnetNewMobile.value = row.custBankAcctNo || "";
    handleQueryChemnet();
  } else if (row.scriptKey === "bankofsun-comm2-credit") {
    scriptKey.value = "bankofsun-comm2-credit";
    bankofsunText.value = row.rawText || buildBankofsunTextFromRow(row);
    bankofsunPreviewData.value = null;
  } else {
    scriptKey.value = "sinoloans-comm3-loan";
    inputText.value = row.rawText || buildTextFromRow(row);
    previewData.value = null;
  }
  message.success("已回填该条记录数据");
  execCardRef.value?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function buildBankofsunTextFromRow(row: PlatformScriptRunItem): string {
  return [
    `企业名称:${row.applId}`,
    `统一社会信用代码:${row.custBankAcctNo}`,
    `法人姓名:${row.cntprNme}`,
    `近两年平均交易量:${row.custPayAmt}`,
    `对公客户号:${row.cntrctNo}`,
  ].join("\n");
}

function buildTextFromRow(row: PlatformScriptRunItem): string {
  return [
    `申请编号:${row.applId}`,
    `收款银行账户:${row.custBankAcctNo}`,
    `合同号:${row.cntrctNo}`,
    `提款金额:${row.custPayAmt}`,
    `交易对手户名:${row.cntprNme}`,
    `开户网点号:${row.actcpeBchnwId}`,
    `开户网点名:${row.actopeBchnwNme}`,
  ].join("\n");
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

.ps-highlight-mobile {
  font-size: 15px;
  font-weight: 700;
  color: #2b7a0b;
}

.ps-empty-tip {
  padding: 12px 0;
  font-size: 13px;
  color: #c0662b;
}

.ps-edit-box {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px dashed rgba(74, 138, 54, 0.2);
}

.ps-edit-box__title {
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 700;
  color: var(--ai-text, #794f27);
}

.ps-edit-box__form {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.ps-panel__footer {
  display: flex;
  gap: 8px;
  margin-top: 14px;
}

.ps-match-status {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(74, 138, 54, 0.08);
  font-size: 13px;
}

.ps-match-status--new {
  background: rgba(230, 140, 30, 0.1);
}

.ps-match-tip {
  font-size: 12px;
  color: var(--ai-text, #794f27);
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
