/**
 * 通知公告 API（已禁用：后端无通知功能）
 * 所有方法返回空数据，避免组件引用报错
 */

const NoticeAPI = {
  getPage() {
    return Promise.resolve({ list: [], total: 0 });
  },
  getFormData(_id: string) {
    return Promise.resolve({});
  },
  create(_data: any) {
    return Promise.resolve();
  },
  update(_id: string, _data: any) {
    return Promise.resolve();
  },
  deleteByIds(_ids: string) {
    return Promise.resolve();
  },
  publish(_id: string) {
    return Promise.resolve();
  },
  revoke(_id: string) {
    return Promise.resolve();
  },
  getDetail(_id: string) {
    return Promise.resolve({});
  },
  readAll() {
    return Promise.resolve();
  },
  getMyNoticePage() {
    return Promise.resolve({ list: [], total: 0 });
  },
};

export default NoticeAPI;
