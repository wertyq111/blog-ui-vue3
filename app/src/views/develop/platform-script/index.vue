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

      <!-- 脚本卡片选择列表 -->
      <div class="ps-card-grid">
        <div
          v-for="opt in scriptOptions"
          :key="opt.value"
          class="ps-script-card"
          :class="{ 'ps-script-card--active': scriptKey === opt.value }"
          @click="selectScript(opt.value)"
        >
          <div class="ps-script-card__header">
            <div class="ps-script-card__icon-title">
              <div class="ps-script-card__icon-wrap" :class="`ps-script-card__icon-wrap--${opt.tagType}`">
                <AnimalMenuIcon :name="opt.iconName" :size="24" />
              </div>
              <span class="ps-script-card__name">{{ opt.title }}</span>
            </div>
            <el-tag size="small" :type="opt.tagType" effect="plain" class="ps-script-card__tag">
              {{ opt.tag }}
            </el-tag>
          </div>
          <div class="ps-script-card__desc">{{ opt.desc }}</div>
          <div class="ps-script-card__footer">
            <span v-if="scriptKey === opt.value" class="ps-script-card__badge">
              <SystemIco name="check" :size="12" /> 已选择
            </span>
            <span v-else class="ps-script-card__action">点击切换</span>
          </div>
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
          <Button type="primary" size="small" :disabled="progressing" @click="handleQueryProgressBankofsun">
            <SystemIco name="search" :size="13" />
            查询授信进度
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
                ? `匹配成功 (企业 CID: ${bankofsunPreviewData.company_data?.cid || '-'})，未传字段已自动继承档案原值，仅当您显式提供新值时才会进行修改`
                : '未检索到该企业档案，流转时将自动在平台创建新企业档案与补充材料'
              }}
            </span>
          </div>

          <!-- 历史 apply_no 冲突预警与清空控制 -->
          <div
            v-if="bankofsunPreviewData.company_data?.has_apply_no"
            class="ps-applyno-alert"
          >
            <div class="ps-applyno-alert__header">
              <div class="ps-applyno-alert__title">
                <el-tag type="danger" size="small" effect="dark">
                  历史单号冲突预警
                </el-tag>
                <span class="ps-applyno-alert__heading font-bold">检测到该企业已绑定历史交行申请单号 (apply_no)</span>
              </div>
            </div>
            <div class="ps-applyno-alert__body">
              <div class="ps-applyno-alert__info-row">
                <span class="ps-applyno-alert__label">库中绑定单号：</span>
                <span class="ps-applyno-alert__value cell-mono font-bold">{{ bankofsunPreviewData.company_data.apply_no }}</span>
                <el-tag v-if="bankofsunPreviewData.company_data.cust_name" size="small" type="info" class="ps-applyno-alert__cust">
                  客户名: {{ bankofsunPreviewData.company_data.cust_name }}
                </el-tag>
              </div>
              <div class="ps-applyno-alert__desc">
                若交行本次使用新的申请编号发起联调，金服会因历史单号未清空而判定单号不匹配，直接拒绝担保（返回 guarantee = 'N'，交易额 0）。
              </div>
              <div class="ps-applyno-alert__action">
                <el-checkbox v-model="bankofsunClearApplyNo" class="ps-applyno-checkbox">
                  <span class="font-bold">流转至阶段三时【清空历史申请编号】（置为 NULL，推荐）</span>
                </el-checkbox>
                <div class="ps-applyno-tip">
                  {{ bankofsunClearApplyNo ? '✓ 达成阶段三时将自动把 apply_no 和 cust_name 置空，允许交行以新单号发起查询并自动绑定' : '✕ 保留原有历史单号，仅允许交行以完全相同的单号重试' }}
                </div>
              </div>
            </div>
          </div>

          <!-- 1. 已建档：对比表格视图 -->
          <template v-if="bankofsunPreviewData.matched && bankofsunPreviewData.company_data">
            <div class="ps-diff-table-wrap">
              <table class="tbl ps-diff-table">
                <thead>
                  <tr>
                    <th style="width: 140px">对比字段</th>
                    <th class="ps-th-old" style="width: 38%">
                      <span class="ps-th-badge ps-th-badge--old">原档案</span>
                      当前建档原值 (查询结果)
                    </th>
                    <th class="ps-th-new" style="width: 38%">
                      <span class="ps-th-badge ps-th-badge--new">新提交</span>
                      本次提交执行值 (流转更新)
                    </th>
                    <th style="width: 110px; text-align: center">变化比对</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="diff in bankofsunDiffList"
                    :key="diff.key"
                    :class="[
                    diff.diffType === 'changed' ? 'ps-diff-row--changed' : '',
                    diff.diffType === 'added' ? 'ps-diff-row--added' : '',
                  ]"
                  >
                    <td class="font-bold">{{ diff.label }}</td>
                    <td class="cell-mono ps-diff-cell-old">
                      {{ diff.oldValDisplay }}
                    </td>
                    <td class="cell-mono ps-diff-cell-new" :class="{ 'ps-text-highlight': diff.diffType === 'changed' || diff.diffType === 'added' }">
                      {{ diff.newValDisplay }}
                    </td>
                    <td style="text-align: center">
                      <el-tag v-if="diff.diffType === 'changed'" type="warning" size="small" effect="dark">
                        已修改
                      </el-tag>
                      <el-tag v-else-if="diff.diffType === 'added'" type="primary" size="small">
                        新补充
                      </el-tag>
                      <el-tag v-else-if="diff.diffType === 'inherited'" type="info" size="small">
                        继承原值
                      </el-tag>
                      <el-tag v-else type="info" size="small">
                        无变化
                      </el-tag>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 流转专属参数 -->
            <div class="ps-extra-params">
              <div class="ps-extra-params__title">流转申请参数：</div>
              <div class="ps-grid">
                <div class="ps-grid__item">
                  <span class="ps-grid__label">对公客户号 / 贷款卡号</span>
                  <span class="ps-grid__value cell-mono font-bold">{{ bankofsunPreviewData.fields.loan_cardno || '（未填写/默认）' }}</span>
                </div>
                <div class="ps-grid__item">
                  <span class="ps-grid__label">申请授信额度</span>
                  <span class="ps-grid__value cell-mono font-bold">{{ formatBankofsunFieldValue('amount', bankofsunPreviewData.fields.amount) }}</span>
                </div>
                <div v-if="bankofsunPreviewData.company_data?.has_apply_no" class="ps-grid__item">
                  <span class="ps-grid__label">历史交行申请单号 (apply_no)</span>
                  <span class="ps-grid__value cell-mono font-bold" :class="{ 'ps-text-strikethrough': bankofsunClearApplyNo }">
                    {{ bankofsunPreviewData.company_data.apply_no }}
                  </span>
                </div>
                <div v-if="bankofsunPreviewData.company_data?.has_apply_no" class="ps-grid__item">
                  <span class="ps-grid__label">本次执行单号策略</span>
                  <span class="ps-grid__value font-bold" :class="bankofsunClearApplyNo ? 'ps-text-success' : 'ps-text-warning'">
                    {{ bankofsunClearApplyNo ? '✓ 执行阶段三时清空（置为 NULL）' : '✕ 保留原历史单号' }}
                  </span>
                </div>
                <div class="ps-grid__item ps-grid__item--ordr">
                  <span class="ps-grid__label">订单号 / 流水号 ordrNo（自增）</span>
                  <span class="ps-grid__value cell-mono">{{ bankofsunPreviewData.ordr_no }}</span>
                </div>
              </div>
            </div>
          </template>

          <!-- 2. 未建档：直接展示所有解析字段 -->
          <template v-else>
            <div class="ps-grid">
              <div v-for="def in bankofsunFieldDefs" :key="def.key" class="ps-grid__item">
                <span class="ps-grid__label">{{ def.label }}</span>
                <span class="ps-grid__value cell-mono">
                  {{ formatBankofsunFieldValue(def.key, bankofsunPreviewData.fields[def.key]) }}
                </span>
              </div>
              <div class="ps-grid__item ps-grid__item--ordr">
                <span class="ps-grid__label">订单号 / 流水号 ordrNo（自增）</span>
                <span class="ps-grid__value cell-mono">{{ bankofsunPreviewData.ordr_no }}</span>
              </div>
            </div>
          </template>

          <div class="ps-panel__footer">
            <Button type="primary" size="small" :disabled="running" @click="handleConfirmRunBankofsun">
              <SystemIco name="save" :size="13" />
              一键执行流转（阶段一至阶段三）
            </Button>
            <Button type="default" size="small" @click="bankofsunPreviewData = null">取消</Button>
          </div>
        </div>

        <!-- 授信进度面板 -->
        <div v-if="bankofsunProgressData" class="ps-panel ps-panel--progress">
          <div class="ps-panel__title">
            <SystemIco name="search" :size="13" />
            授信进度（交总行企业贷 2.0）
          </div>

          <div v-if="!bankofsunProgressData.matched" class="ps-progress-empty">
            {{ bankofsunProgressData.message }}
          </div>

          <template v-else-if="bankofsunProgressData.progress">
            <div class="ps-progress-steps">
              <div
                v-for="(step, idx) in bankofsunProgressSteps"
                :key="step.label"
                class="ps-progress-step"
                :class="`ps-progress-step--${step.state}`"
              >
                <div class="ps-progress-step__dot">{{ idx + 1 }}</div>
                <div class="ps-progress-step__body">
                  <div class="ps-progress-step__label">{{ step.label }}</div>
                  <div class="ps-progress-step__desc">{{ step.desc }}</div>
                </div>
              </div>
            </div>

            <div class="ps-grid">
              <div class="ps-grid__item">
                <span class="ps-grid__label">企业名称</span>
                <span class="ps-grid__value font-bold">{{ bankofsunProgressData.progress.company }}</span>
              </div>
              <div class="ps-grid__item">
                <span class="ps-grid__label">银行申请编号 (apply_no)</span>
                <span class="ps-grid__value cell-mono">{{ bankofsunProgressData.progress.apply_no || '（未绑定）' }}</span>
              </div>
              <div class="ps-grid__item">
                <span class="ps-grid__label">银行客户名</span>
                <span class="ps-grid__value">{{ bankofsunProgressData.progress.cust_name || '-' }}</span>
              </div>
              <div class="ps-grid__item">
                <span class="ps-grid__label">担保有效期</span>
                <span class="ps-grid__value cell-mono">{{ bankofsunProgressData.progress.effective_date }}</span>
              </div>
              <div class="ps-grid__item">
                <span class="ps-grid__label">授信申请额度</span>
                <span class="ps-grid__value cell-mono font-bold" :class="{ 'ps-text-warning': !bankofsunProgressData.progress.amount_enough }">
                  {{ bankofsunProgressData.progress.amount }} 元
                </span>
              </div>
              <div class="ps-grid__item">
                <span class="ps-grid__label">银行授信额度</span>
                <span class="ps-grid__value cell-mono font-bold">
                  {{ bankofsunProgressData.progress.credit_line || '（未取到）' }}
                </span>
              </div>
              <div v-if="bankofsunProgressData.progress.contract_no" class="ps-grid__item">
                <span class="ps-grid__label">担保合同号</span>
                <span class="ps-grid__value cell-mono">{{ bankofsunProgressData.progress.contract_no }}</span>
              </div>
              <div v-if="bankofsunProgressData.progress.confirm_time" class="ps-grid__item">
                <span class="ps-grid__label">确认担保时间</span>
                <span class="ps-grid__value cell-mono">{{ bankofsunProgressData.progress.confirm_time }}</span>
              </div>
            </div>

            <!-- 额度不足预警与强制开关 -->
            <div v-if="!bankofsunProgressData.progress.amount_enough" class="ps-applyno-alert">
              <div class="ps-applyno-alert__header">
                <div class="ps-applyno-alert__title">
                  <el-tag type="danger" size="small" effect="dark">额度校验不通过</el-tag>
                  <span class="ps-applyno-alert__heading font-bold">授信申请额度小于银行授信额度</span>
                </div>
              </div>
              <div class="ps-applyno-alert__body">
                <div class="ps-applyno-alert__desc">
                  bankofsun 处理中心在这种情况下会直接拦截、不发报文。强制推送后银行大概率返回拒绝，仅用于联调边界场景。
                </div>
                <div class="ps-applyno-alert__action">
                  <el-checkbox v-model="bankofsunSkipAmountCheck" class="ps-applyno-checkbox">
                    <span class="font-bold">忽略额度校验强制推送</span>
                  </el-checkbox>
                </div>
              </div>
            </div>

            <!-- 关联流水号 -->
            <div class="ps-extra-params">
              <div class="ps-extra-params__title">本次推送关联流水号：</div>
              <el-select v-model="bankofsunBindOrdrNo" size="small" style="width: 100%">
                <el-option
                  v-for="candidate in bankofsunProgressData.ordr_no_candidates"
                  :key="candidate.id"
                  :value="candidate.ordr_no"
                  :label="`${candidate.ordr_no} · ${candidate.action_label} · ${candidate.created_at}`"
                />
                <el-option
                  :value="bankofsunProgressData.next_ordr_no"
                  :label="`${bankofsunProgressData.next_ordr_no} · 新开流水号`"
                />
              </el-select>
            </div>

            <div class="ps-panel__footer">
              <Button
                type="primary"
                size="small"
                :disabled="running || !bankofsunProgressData.progress.can_confirm"
                @click="handleConfirmGuaranteeBankofsun"
              >
                <SystemIco name="save" :size="13" />
                确认担保推送
              </Button>
              <span v-if="!bankofsunProgressData.progress.can_confirm" class="ps-block-reason">
                {{ bankofsunProgressData.progress.block_reason }}
              </span>
              <Button type="default" size="small" @click="bankofsunProgressData = null">收起</Button>
            </div>
          </template>
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
            <template v-for="group in groupedDataList" :key="group.ordrNo">
              <!-- 父行 -->
              <tr class="ps-group-row" :class="{ 'ps-group-row--expandable': group.rows.length > 1 }">
                <td class="cell-num">
                  <span
                    v-if="group.rows.length > 1"
                    class="ps-expand-toggle"
                    @click="toggleOrdrNo(group.ordrNo)"
                  >
                    {{ expandedOrdrNos.has(group.ordrNo) ? '▾' : '▸' }}
                  </span>
                  <span v-else>{{ group.rows[0].id }}</span>
                </td>
                <td class="cell-mono">
                  {{ group.ordrNo }}
                  <el-tag v-if="group.rows.length > 1" size="small" type="info" class="ps-group-count">
                    {{ group.rows.length }} 条
                  </el-tag>
                </td>
                <td>
                  <el-tag size="small" :type="group.rows[0].scriptKey === 'chemnet-secret-code' ? 'info' : 'primary'">
                    {{ formatScriptKey(group.rows[0].scriptKey) }}
                  </el-tag>
                </td>
                <td class="cell-mono font-bold">{{ group.rows[0].applId }}</td>
                <td>
                  <template v-if="group.rows.length > 1">
                    最新：{{ formatRecordAction(group.rows[0]) }}
                  </template>
                  <template v-else>{{ formatRecordDetail(group.rows[0]) }}</template>
                </td>
                <td>
                  <el-tag :type="statusMeta(group.rows[0].status).type" size="small">
                    {{ statusMeta(group.rows[0].status).text }}
                  </el-tag>
                </td>
                <td class="cell-mono">{{ group.rows[0].createTime }}</td>
                <td>
                  <span class="tbl-actions">
                    <span class="action-link act-edit" @click="handleViewOutput(group.rows[0])">
                      <SystemIco name="search" :size="12" />
                      查看
                    </span>
                  </span>
                </td>
              </tr>

              <!-- 子行 -->
              <template v-if="group.rows.length > 1 && expandedOrdrNos.has(group.ordrNo)">
                <tr v-for="row in group.rows" :key="row.id" class="ps-child-row">
                  <td class="cell-num">{{ row.id }}</td>
                  <td></td>
                  <td>
                    <el-tag size="small" type="warning">{{ formatRecordAction(row) }}</el-tag>
                  </td>
                  <td class="cell-mono">{{ row.applId }}</td>
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
              </template>
            </template>

            <tr v-if="!loading && groupedDataList.length === 0" class="empty-row">
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
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useClipboard } from "@vueuse/core";

import { Button, Input } from "animal-island-vue";
import SystemIco from "@/components/AdminPage/SystemIco.vue";
import AnimalMenuIcon from "@/components/AnimalMenuIcon/index.vue";
import PlatformScriptAPI from "@/api/develop/platform-script";
import type {
  BankofsunComm2CreditFields,
  BankofsunComm2PreviewResult,
  BankofsunMatchedCompanyData,
  BankofsunCreditProgress,
  BankofsunProgressResult,
  ChemnetPreviewResult,
  PlatformScriptFields,
  PlatformScriptQueryParams,
  PlatformScriptRunItem,
} from "@/types/api/platform-script";

defineOptions({ name: "PlatformScript", inheritAttrs: false });

const scriptOptions = [
  {
    value: "bankofsun-comm2-credit",
    iconName: "script-corporate-credit",
    title: "bankofsun 交行企业贷 2.0 授信数据生成",
    tag: "bankofsun",
    tagType: "success" as const,
    desc: "企业信息文本智能解析、建档档案比对与一键阶段一至三（已同意担保）流转",
  },
  {
    value: "sinoloans-comm3-loan",
    iconName: "script-loan-disburse",
    title: "sinoloans 交行个经贷放款测试推送",
    tag: "sinoloans",
    tagType: "primary" as const,
    desc: "解析放款报文参数并生成自增订单号，真实推送到银行测试网关",
  },
  {
    value: "chemnet-secret-code",
    iconName: "script-phone-code",
    title: "ChemNet 验证码手机号修改",
    tag: "ChemNet",
    tagType: "warning" as const,
    desc: "查询用户注册手机号并修改 hub_chinachemnet.secret_code",
  },
];

function selectScript(val: string): void {
  if (scriptKey.value === val) return;
  scriptKey.value = val;
  handleScriptChange();
}

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

function formatBankofsunFieldValue(key: keyof BankofsunComm2CreditFields, value: any): string {
  if (value === undefined || value === null || value === "") {
    return "（未填写/默认）";
  }
  if (key === "buyer_company_type") {
    if (value === "S") return "S（生产型/微型企业，代码 0）";
    if (value === "M") return "M（贸易型企业，代码 1）";
    return String(value);
  }
  if (key === "amount") {
    const yuan = Number(value) / 100;
    const wan = yuan / 10000;
    return `${value} 分（${wan} 万元）`;
  }
  if (key === "trade_amount") {
    return `${value} 万元`;
  }
  return String(value);
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
const bankofsunClearApplyNo = ref(true);
const bankofsunProgressData = ref<BankofsunProgressResult | null>(null);
const bankofsunBindOrdrNo = ref<string>("");
const bankofsunSkipAmountCheck = ref(false);
const progressing = ref(false);

/** 授信进度时间轴节点 */
const bankofsunProgressSteps = computed(() => {
  const p = bankofsunProgressData.value?.progress;
  if (!p) return [];

  const guaranteeText =
    p.guarantee_status === 1 ? "已同意担保" : p.guarantee_status === 2 ? "担保过期" : "等待同意";
  const approvedText =
    p.approved_status === "01" ? "通过" : p.approved_status === "00" ? "未通过" : "等待银行审核";
  const signedText =
    p.signed_status === "01" ? "正常" : p.signed_status === "00" ? "异常" : "等待银行合同签署";
  const agreedText =
    p.agreed_status === "0" ? "已确认担保" : p.agreed_status === "1" ? "已拒绝担保" : "待确认";

  return [
    { label: "平台建档", desc: `企业 CID ${p.cid} / 授信申请 ${p.aid}`, state: "done" },
    {
      label: "阶段一至三流转",
      desc: guaranteeText,
      state: p.guarantee_status === 1 ? "done" : p.guarantee_status === 2 ? "error" : "wait",
    },
    {
      label: "交行查交易额",
      desc: p.apply_no ? `已绑定申请编号 ${p.apply_no}` : "交行尚未查询交易额",
      state: p.apply_no ? "done" : "wait",
    },
    {
      label: "银行审批",
      desc: approvedText,
      state: p.approved_status === "01" ? "done" : p.approved_status === "00" ? "error" : "wait",
    },
    {
      label: "合同签署",
      desc: signedText,
      state: p.signed_status === "01" ? "done" : p.signed_status === "00" ? "error" : "wait",
    },
    {
      label: "确认担保",
      desc: p.contract_no ? `${agreedText}，合同号 ${p.contract_no}` : agreedText,
      state: p.agreed_status === "0" ? "done" : p.agreed_status === "1" ? "error" : "wait",
    },
  ];
});

interface BankofsunDiffItem {
  key: string;
  label: string;
  oldValDisplay: string;
  newValDisplay: string;
  diffType: "same" | "changed" | "added" | "inherited";
}

const bankofsunDiffList = computed<BankofsunDiffItem[]>(() => {
  if (!bankofsunPreviewData.value?.matched || !bankofsunPreviewData.value?.company_data) {
    return [];
  }
  const companyData = bankofsunPreviewData.value.company_data;
  const fields = bankofsunPreviewData.value.fields;
  const explicitKeys = new Set(bankofsunPreviewData.value.explicit_keys || []);

  const compareDefs: {
    key: string;
    label: string;
    getOld: (d: BankofsunMatchedCompanyData) => string;
    getNew: (f: BankofsunComm2CreditFields) => string;
    formatOld?: (v: string) => string;
    formatNew?: (v: string) => string;
  }[] = [
    {
      key: "company",
      label: "企业全称",
      getOld: (d) => d.company || "",
      getNew: (f) => f.company || "",
    },
    {
      key: "social_credit_code",
      label: "统一社会信用代码",
      getOld: (d) => d.social_credit_code || "",
      getNew: (f) => f.social_credit_code || "",
    },
    {
      key: "legal",
      label: "法人姓名",
      getOld: (d) => d.legal || "",
      getNew: (f) => f.legal || "",
    },
    {
      key: "id_card",
      label: "法人身份证号",
      getOld: (d) => d.id_card || "",
      getNew: (f) => f.id_card || "",
    },
    {
      key: "mobile",
      label: "手机号",
      getOld: (d) => d.mobile || "",
      getNew: (f) => f.mobile || "",
    },
    {
      key: "buyer_company_type",
      label: "企业类型",
      getOld: (d) => (d.buyerCompanyType ? (d.buyerCompanyType.toUpperCase() === "S" ? "S" : "M") : ""),
      getNew: (f) => f.buyer_company_type || "",
      formatOld: (v) => (v ? (v === "S" ? "S（生产型/微型企业，代码 0）" : "M（贸易型企业，代码 1）") : "（未设置）"),
      formatNew: (v) => (v ? (v === "S" ? "S（生产型/微型企业，代码 0）" : "M（贸易型企业，代码 1）") : "（未填写）"),
    },
    {
      key: "trade_amount",
      label: "近两年平均交易量",
      getOld: (d) => (d.aveInterAmt !== undefined && d.aveInterAmt !== null && d.aveInterAmt !== "" ? String(d.aveInterAmt) : ""),
      getNew: (f) => (f.trade_amount !== undefined && f.trade_amount !== null ? String(f.trade_amount) : ""),
      formatOld: (v) => (v ? `${v} 万元` : "（未设置）"),
      formatNew: (v) => (v ? `${v} 万元` : "（未填写）"),
    },
    {
      key: "ecif_cst_no",
      label: "法人客户号",
      getOld: (d) => d.ECIFCstNo || "",
      getNew: (f) => f.ecif_cst_no || "",
    },
  ];

  return compareDefs.map((def) => {
    const rawOld = def.getOld(companyData).trim();
    const rawNew = def.getNew(fields).trim();
    const isExplicit = explicitKeys.has(def.key);

    let diffType: "same" | "changed" | "added" | "inherited" = "same";

    if (!isExplicit && def.key !== "company" && def.key !== "social_credit_code") {
      diffType = "inherited";
    } else if (!rawOld && rawNew) {
      diffType = "added";
    } else if (rawOld !== rawNew) {
      diffType = "changed";
    }

    const oldValDisplay = def.formatOld ? def.formatOld(rawOld) : (rawOld || "（空）");
    const newValDisplay = def.formatNew ? def.formatNew(rawNew) : (rawNew || "（空）");

    return {
      key: def.key,
      label: def.label,
      oldValDisplay,
      newValDisplay,
      diffType,
    };
  });
});

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
const expandedOrdrNos = ref<Set<string>>(new Set());

/** 按流水号分组后的执行记录 */
const groupedDataList = computed(() => {
  const groups: { ordrNo: string; rows: PlatformScriptRunItem[] }[] = [];
  const indexMap = new Map<string, number>();

  dataList.value.forEach((row) => {
    const key = row.ordrNo;
    if (!indexMap.has(key)) {
      indexMap.set(key, groups.length);
      groups.push({ ordrNo: key, rows: [] });
    }
    groups[indexMap.get(key)!].rows.push(row);
  });

  return groups;
});

function toggleOrdrNo(ordrNo: string): void {
  const next = new Set(expandedOrdrNos.value);
  if (next.has(ordrNo)) {
    next.delete(ordrNo);
  } else {
    next.add(ordrNo);
  }
  expandedOrdrNos.value = next;
}

/** 从 requestData 解析本条记录的动作标签 */
function formatRecordAction(row: PlatformScriptRunItem): string {
  if (row.scriptKey !== "bankofsun-comm2-credit") return "-";
  try {
    const action = JSON.parse(row.requestData || "{}").action;
    if (action === "confirm_guarantee") return "确认担保推送";
    return "阶段一至三流转";
  } catch {
    return "阶段一至三流转";
  }
}

function handleScriptChange(): void {
  previewData.value = null;
  chemnetQueryResult.value = null;
  bankofsunPreviewData.value = null;
  bankofsunClearApplyNo.value = true;
  bankofsunProgressData.value = null;
  bankofsunBindOrdrNo.value = "";
  bankofsunSkipAmountCheck.value = false;
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
    // 检测历史申请单号
    if (res.company_data?.has_apply_no) {
      bankofsunClearApplyNo.value = true;
      message.warning(`检测到该企业已绑定历史交行申请单号【${res.company_data.apply_no}】，已为您默认开启清空选项`);
    } else if (res.matched) {
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
  bankofsunClearApplyNo.value = true;
  bankofsunProgressData.value = null;
  bankofsunBindOrdrNo.value = "";
  bankofsunSkipAmountCheck.value = false;
  result.value = null;
  message.success("已填入测试企业数据示例");
}

function handleClearBankofsun(): void {
  bankofsunText.value = "";
  bankofsunPreviewData.value = null;
  bankofsunClearApplyNo.value = true;
  bankofsunProgressData.value = null;
  bankofsunBindOrdrNo.value = "";
  bankofsunSkipAmountCheck.value = false;
  result.value = null;
}

async function handleQueryProgressBankofsun(): Promise<void> {
  if (!bankofsunText.value.trim()) {
    message.warning("请粘贴企业文本或统一社会信用代码");
    return;
  }
  progressing.value = true;
  result.value = null;
  bankofsunPreviewData.value = null;
  try {
    const res = await PlatformScriptAPI.progress(scriptKey.value, { text: bankofsunText.value });
    bankofsunProgressData.value = res;
    bankofsunBindOrdrNo.value = res.ordr_no_candidates[0]?.ordr_no ?? res.next_ordr_no;
    bankofsunSkipAmountCheck.value = false;

    if (!res.matched) {
      message.warning(res.message || "未查询到该企业的授信记录");
    } else if (res.progress?.can_confirm) {
      message.success("该笔授信已具备确认担保条件");
    } else {
      message.info(res.progress?.block_reason || "该笔授信暂不满足确认担保条件");
    }
  } catch {
    bankofsunProgressData.value = null;
  } finally {
    progressing.value = false;
  }
}

function handleConfirmGuaranteeBankofsun(): void {
  const p = bankofsunProgressData.value?.progress;
  if (!p) return;

  const isNewOrdrNo = bankofsunBindOrdrNo.value === bankofsunProgressData.value?.next_ordr_no;
  let confirmMsg =
    `确认对企业【${p.company}】推送「同意担保」吗？\n\n` +
    `银行申请编号：${p.apply_no}\n` +
    `关联流水号：${bankofsunBindOrdrNo.value}${isNewOrdrNo ? "（新开）" : "（复用已有流水）"}\n\n` +
    `该操作会真实向银行测试网关发送 agreeGuarantee 报文。`;

  if (!p.amount_enough && bankofsunSkipAmountCheck.value) {
    confirmMsg =
      `⚠️ 你已勾选【忽略额度校验强制推送】。\n\n` +
      `授信申请额度 ${p.amount} 元 小于 银行授信额度 ${p.credit_line} 元，` +
      `bankofsun 处理中心在这种情况下会拦截不发报文。强制推送后银行大概率返回拒绝。\n\n` +
      confirmMsg;
  }

  confirm(confirmMsg, "确认担保推送", {
    confirmButtonText: "确认推送",
    cancelButtonText: "取消",
    type: !p.amount_enough ? "warning" : "info",
  }).then(
    () => {
      running.value = true;
      const targetCreditCode =
        bankofsunProgressData.value?.progress?.social_credit_code ||
        bankofsunProgressData.value?.social_credit_code ||
        bankofsunText.value;
      PlatformScriptAPI.confirmGuarantee(scriptKey.value, {
        text: targetCreditCode,
        ordr_no: bankofsunBindOrdrNo.value,
        skip_amount_check: bankofsunSkipAmountCheck.value,
      })
        .then((run) => {
          result.value = run;
          if (run.status === "success") {
            message.success(`企业【${p.company}】确认担保推送成功！`);
            handleQueryProgressBankofsun();
          } else {
            message.error(run.error || "确认担保推送失败");
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

// 文本框输入变动时清空当前预览快照与进度快照，防止推送到非面板展示的企业
watch(bankofsunText, () => {
  if (bankofsunProgressData.value) {
    bankofsunProgressData.value = null;
    bankofsunBindOrdrNo.value = "";
    bankofsunSkipAmountCheck.value = false;
  }
  if (bankofsunPreviewData.value) {
    bankofsunPreviewData.value = null;
    bankofsunClearApplyNo.value = true;
  }
});

watch(inputText, () => {
  if (previewData.value) {
    previewData.value = null;
  }
});

function handleConfirmRunBankofsun(): void {
  if (!bankofsunPreviewData.value) return;
  const companyName = bankofsunPreviewData.value.fields.company;
  const ordrNo = bankofsunPreviewData.value.ordr_no;
  const hasHistoryApplyNo = Boolean(bankofsunPreviewData.value.company_data?.has_apply_no);
  const clearApplyNo = bankofsunClearApplyNo.value;

  let confirmMsg = `确认对企业【${companyName}】一键执行阶段一至阶段三自动流转吗？（流水号：${ordrNo}）`;
  if (hasHistoryApplyNo) {
    const actionDesc = clearApplyNo ? "【清空历史申请单号】（置为 NULL，允许交行新单号接入）" : "【保留历史申请单号】";
    confirmMsg = `检测到企业【${companyName}】已绑定历史申请单号【${bankofsunPreviewData.value.company_data?.apply_no}】。\n\n本次流转将 ${actionDesc}。\n\n确认继续执行阶段一至阶段三自动流转吗？（流水号：${ordrNo}）`;
  }

  confirm(
    confirmMsg,
    "确认执行流转",
    {
      confirmButtonText: "确认执行",
      cancelButtonText: "取消",
      type: hasHistoryApplyNo && !clearApplyNo ? "warning" : "info",
    }
  ).then(
    () => {
      running.value = true;
      PlatformScriptAPI.run(scriptKey.value, {
        text: bankofsunText.value,
        clear_apply_no: clearApplyNo,
      })
        .then((run) => {
          result.value = run;
          bankofsunPreviewData.value = null;
          if (run.status === "success") {
            const clearNote = hasHistoryApplyNo && clearApplyNo ? "（已自动清空旧 apply_no）" : "";
            message.success(`企业【${companyName}】授信数据已成功生成并达成阶段三${clearNote}！`);
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
.ps-card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin: 6px 0 16px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
}

.ps-script-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1.5px solid rgba(121, 79, 39, 0.14);
  background: var(--ai-bg-card, #ffffff);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;

  &:hover {
    border-color: rgba(74, 138, 54, 0.45);
    background: rgba(247, 251, 243, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(121, 79, 39, 0.06);
  }
}

.ps-script-card--active {
  border-color: #4a8a36 !important;
  background: rgba(74, 138, 54, 0.08) !important;
  box-shadow: 0 4px 14px rgba(74, 138, 54, 0.14);

  .ps-script-card__name {
    color: #2b7a0b;
    font-weight: 700;
  }
}

.ps-script-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.ps-script-card__icon-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ps-script-card__icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: rgba(121, 79, 39, 0.06);
  border: 1.5px solid rgba(121, 79, 39, 0.12);
  flex-shrink: 0;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &--success {
    background: rgba(111, 186, 44, 0.12);
    border-color: rgba(111, 186, 44, 0.3);
  }

  &--primary {
    background: rgba(78, 165, 217, 0.12);
    border-color: rgba(78, 165, 217, 0.3);
  }

  &--warning {
    background: rgba(255, 204, 59, 0.18);
    border-color: rgba(255, 180, 0, 0.35);
  }
}

.ps-script-card:hover .ps-script-card__icon-wrap {
  transform: scale(1.08) translateY(-1px);
  box-shadow: 0 3px 8px rgba(61, 52, 40, 0.1);
}

.ps-script-card--active .ps-script-card__icon-wrap {
  transform: scale(1.05);
  box-shadow: 0 2px 6px rgba(74, 138, 54, 0.18);
}

.ps-script-card__name {
  font-size: 13px;
  font-weight: 600;
  color: var(--ai-text, #794f27);
  line-height: 1.3;
}

.ps-script-card__tag {
  flex-shrink: 0;
  font-weight: 600;
}

.ps-script-card__desc {
  font-size: 12px;
  color: rgba(121, 79, 39, 0.65);
  line-height: 1.45;
  margin-bottom: 10px;
  flex: 1;
}

.ps-script-card__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: 11px;
}

.ps-script-card__badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #2b7a0b;
  font-weight: 700;
  background: rgba(43, 122, 11, 0.1);
  padding: 2px 8px;
  border-radius: 8px;
}

.ps-script-card__action {
  color: rgba(121, 79, 39, 0.45);
}

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

.ps-applyno-alert {
  margin: 10px 0 16px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(230, 90, 40, 0.08);
  border: 1.5px solid rgba(230, 90, 40, 0.28);
}

.ps-applyno-alert__header {
  margin-bottom: 8px;
}

.ps-applyno-alert__title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ps-applyno-alert__heading {
  font-size: 13px;
  color: #c0392b;
}

.ps-applyno-alert__body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ps-applyno-alert__info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.ps-applyno-alert__label {
  color: rgba(121, 79, 39, 0.75);
}

.ps-applyno-alert__value {
  color: #c0392b;
  font-size: 13px;
}

.ps-applyno-alert__cust {
  margin-left: 4px;
}

.ps-applyno-alert__desc {
  font-size: 12px;
  color: rgba(121, 79, 39, 0.7);
  line-height: 1.45;
}

.ps-applyno-alert__action {
  margin-top: 6px;
  padding-top: 8px;
  border-top: 1px dashed rgba(230, 90, 40, 0.2);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ps-applyno-checkbox {
  font-size: 13px;
  color: var(--ai-text, #794f27);
}

.ps-applyno-tip {
  font-size: 12px;
  color: #2b7a0b;
  margin-left: 24px;
}

.ps-text-strikethrough {
  text-decoration: line-through;
  opacity: 0.55;
}

.ps-text-success {
  color: #2b7a0b;
}

.ps-text-warning {
  color: #c0662b;
}

.ps-diff-table-wrap {
  margin: 12px 0 16px;
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid rgba(121, 79, 39, 0.15);
  background: var(--ai-bg-card, #ffffff);
}

.ps-diff-table {
  width: 100%;
  border-collapse: collapse;

  th {
    font-size: 12px;
    font-weight: 700;
    color: var(--ai-text, #794f27);
    padding: 10px 12px;
    background: rgba(74, 138, 54, 0.08);
  }

  .ps-th-old {
    background: rgba(121, 79, 39, 0.06);
    border-right: 1px solid rgba(121, 79, 39, 0.12);
  }

  .ps-th-new {
    background: rgba(74, 138, 54, 0.12);
    border-left: 2px solid rgba(74, 138, 54, 0.35);
  }

  td {
    font-size: 13px;
    padding: 8px 12px;
    border-top: 1px solid rgba(121, 79, 39, 0.08);
  }

  .ps-diff-cell-old {
    background: rgba(121, 79, 39, 0.02);
    color: rgba(121, 79, 39, 0.7);
    border-right: 1px solid rgba(121, 79, 39, 0.1);
  }

  .ps-diff-cell-new {
    background: rgba(255, 255, 255, 0.7);
    color: var(--ai-text, #794f27);
    font-weight: 600;
    border-left: 2px solid rgba(74, 138, 54, 0.35);
  }
}

.ps-th-badge {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  margin-right: 6px;
}

.ps-th-badge--old {
  background: rgba(121, 79, 39, 0.15);
  color: #794f27;
}

.ps-th-badge--new {
  background: rgba(43, 122, 11, 0.18);
  color: #2b7a0b;
}

.ps-diff-row--changed {
  .ps-diff-cell-new {
    background: rgba(230, 140, 30, 0.12) !important;
    color: #c0662b !important;
    font-weight: 700 !important;
  }
}

.ps-diff-row--added {
  .ps-diff-cell-new {
    background: rgba(43, 122, 11, 0.12) !important;
    color: #2b7a0b !important;
    font-weight: 700 !important;
  }
}

.ps-extra-params {
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(243, 247, 252, 0.7);
  border: 1px dashed rgba(64, 120, 200, 0.25);
}

.ps-extra-params__title {
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 700;
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

.ps-panel--progress {
  .ps-progress-steps {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 14px;
  }

  .ps-progress-step {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    flex: 1 1 180px;
    padding: 8px 10px;
    border-radius: 10px;
    border: 1px solid var(--el-border-color-lighter);

    &__dot {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      font-size: 12px;
      color: #fff;
      background: var(--el-color-info);
      flex-shrink: 0;
    }

    &__label {
      font-weight: 700;
      font-size: 13px;
    }

    &__desc {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      word-break: break-all;
    }

    &--done .ps-progress-step__dot {
      background: var(--el-color-success);
    }

    &--error .ps-progress-step__dot {
      background: var(--el-color-danger);
    }

    &--wait .ps-progress-step__dot {
      background: var(--el-color-info);
    }
  }

  .ps-progress-empty {
    padding: 16px;
    text-align: center;
    color: var(--el-text-color-secondary);
  }

  .ps-block-reason {
    margin-left: 10px;
    font-size: 12px;
    color: var(--el-color-danger);
  }
}

.ps-expand-toggle {
  cursor: pointer;
  user-select: none;
  font-size: 13px;
  color: var(--el-color-primary);
}

.ps-group-count {
  margin-left: 6px;
}

.ps-child-row {
  background: var(--el-fill-color-lighter);

  td {
    font-size: 12px;
  }
}
</style>
