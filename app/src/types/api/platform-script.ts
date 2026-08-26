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

