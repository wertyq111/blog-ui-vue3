import type { BaseQueryParams } from "./common";

/** 平台脚本执行记录查询参数 */
export interface PlatformScriptQueryParams extends BaseQueryParams {
  script_key?: string;
  ordr_no?: string;
  appl_id?: string;
}

/** 解析出的请求字段（后端 preview 裸返回，下划线键） */
export interface PlatformScriptFields {
  appl_id: string;
  cust_bank_acct_no: string;
  cntrct_no: string;
  cust_pay_amt: string;
  cntpr_nme: string;
  actcpe_bchnw_id: string;
  actope_bchnw_nme: string;
}

/** 解析预览结果 */
export interface PlatformScriptPreview {
  script_key: string;
  ordr_no: string;
  fields: PlatformScriptFields;
}

/** ChemNet 验证码表记录 */

export interface ChemnetSecretCodeRecord {
  id: string;
  login: string;
  mobile: string;
  code: string;
  num: string;
  status: string;
  post_time: string;
  post_ip: string;
}

/** ChemNet 查询/预览结果 */
export interface ChemnetPreviewResult {
  script_key: string;
  login: string;
  found: boolean;
  record: ChemnetSecretCodeRecord | null;
  list: ChemnetSecretCodeRecord[];
  ordr_no: string;
}

/** bankofsun 企业贷 2.0 解析字段 */
export interface BankofsunComm2CreditFields {
  company: string;
  social_credit_code: string;
  legal: string;
  id_card: string;
  mobile: string;
  buyer_company_type: string;
  trade_amount: number;
  loan_cardno: string;
  amount: number;
  ecif_cst_no?: string;
}

/** bankofsun 匹配企业信息 */
export interface BankofsunMatchedCompanyData {
  cid: number;
  company: string;
  social_credit_code: string;
  legal?: string;
  id_card?: string;
  mobile?: string;
  company_type?: string;
  buyerCompanyType?: string;
  aveInterAmt?: string | number;
  ECIFCstNo?: string;
  has_comm2_apply?: boolean;
  comm2_apply_id?: number;
  apply_no?: string | null;
  has_apply_no?: boolean;
  cust_name?: string | null;
  guarantee_status?: number;
}

/** bankofsun 预览/匹配结果 */
export interface BankofsunComm2PreviewResult {
  script_key: string;
  fields: BankofsunComm2CreditFields;
  explicit_keys?: string[];
  matched: boolean;
  match_message: string;
  company_data: BankofsunMatchedCompanyData | null;
  ordr_no: string;
}

/** 执行记录 / 执行结果（走 BaseResource，小驼峰键） */
export interface PlatformScriptRunItem {
  id: number;
  scriptKey: string;
  ordrNo: string;
  applId: string;
  cntrctNo: string;
  cntprNme: string;
  custBankAcctNo: string;
  custPayAmt: string;
  actcpeBchnwId: string;
  actopeBchnwNme: string;
  rawText: string;
  requestData: string;
  output: string;
  status: string;
  error: string | null;
  createTime?: string;
}

/** bankofsun 授信进度快照 */
export interface BankofsunCreditProgress {
  cid: number;
  aid: number;
  comm2_apply_id: number;
  company: string;
  social_credit_code: string;
  apply_no: string;
  cust_name: string;
  effective_date: string;
  company_type: string;
  trade_amount: number;
  /** 0 等待同意 / 1 已同意担保 / 2 担保过期 */
  guarantee_status: number;
  /** '' 未回 / '00' 未通过 / '01' 通过 */
  approved_status: string;
  /** '' 未回 / '00' 异常 / '01' 正常 */
  signed_status: string;
  /** '0' 已同意 / '1' 已拒绝 / '2' 待确认 / '-1' 推送中 */
  agreed_status: string;
  credit_line: number;
  amount: number;
  amount_enough: boolean;
  has_sign_result: boolean;
  contract_no: string;
  confirm_time: string;
  can_confirm: boolean;
  block_reason: string;
}

/** bankofsun 可绑定的流水号候选 */
export interface BankofsunOrdrNoCandidate {
  id: number;
  ordr_no: string;
  status: string;
  action: string;
  action_label: string;
  created_at: string;
}

/** bankofsun 授信进度查询结果 */
export interface BankofsunProgressResult {
  script_key: string;
  social_credit_code: string;
  matched: boolean;
  message: string;
  progress: BankofsunCreditProgress | null;
  ordr_no_candidates: BankofsunOrdrNoCandidate[];
  next_ordr_no: string;
}


