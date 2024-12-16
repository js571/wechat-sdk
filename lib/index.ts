import crypto from 'crypto';
import * as xml2js from 'xml2js';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import dayjs from 'dayjs';
import type {
  Device,
  MsgRet,
  TimelineItem,
  TimelineParsedItem,
  TimelineOrigin,
  ChatRoom,
  GroupMember,
  RoomMember,
  LinkRet,
  ContactInfo,
  RobotInfo,
  CheckLogin,
} from './type';

interface CustomAxiosInstance extends AxiosInstance {
  <T = any>(config: AxiosRequestConfig): Promise<T>;
}

export default class WechatService {
  private axios: AxiosInstance;
  constructor(
    private prefix: string,
    private appKey: string,
    private secret: string,
    private client: string,
    private apiUrl: string,
    private partnerId: string,
    private domain: string
  ) {
    this.axios = axios.create({
      baseURL: this.apiUrl,
      timeout: 1000 * 60,
      headers: {
        'Content-Type': 'application/json',
      },
      responseType: 'json',
    });
    this.axios.interceptors.response.use(
      (response) => {
        return response.data;
      },
      (error) => {
        // 处理错误
        return Promise.reject(error);
      }
    );
  }
  md5(ipt: string) {
    return crypto.createHash('md5').update(ipt).digest('hex');
  }
  sleep(timeout: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, timeout);
    });
  }
  wrapSuccess(data: any) {
    return {
      status: 1,
      data,
    };
  }
  wrapError(e: any) {
    return {
      status: 0,
      error: e,
    };
  }
  private async xml2Json<T = Record<string, any>>(xml: string): Promise<T> {
    return new Promise((resolve, reject) => {
      xml2js.parseString(xml, (err, result) => {
        if (err) {
          reject(err);
        } else {
          let ret: T = result;
          resolve(ret);
        }
      });
    });
  }
  private sign(params: Record<string, unknown> = {}) {
    let str = '' + this.secret;
    Object.keys(params)
      .sort()
      .forEach((key) => {
        const val = params[key];
        str += `${key}${val}`;
      });
    str += this.secret;
    const signString = this.md5(str);
    return signString.toUpperCase();
  }
  private async request<T = unknown>(
    method: string,
    data: Record<string, unknown> = {}
  ) {
    const timestamp = Math.round(Date.now() / 1000);
    const sysParams = {
      app_key: this.appKey,
      v: '1.0',
      format: 'json',
      sign_method: 'md5',
      method,
      timestamp,
      client: this.client,
      partner_id: this.partnerId,
      domain: this.domain,
    };
    const signStr = this.sign({
      ...sysParams,
      ...data,
    });
    const finalParams = Object.assign({}, sysParams, {
      sign: signStr,
    });
    try {
      const res = await (this.axios as CustomAxiosInstance)<{
        status: '0000' | string;
        msg: string;
        data: T;
      }>({
        url: this.apiUrl,
        method: 'POST',
        data,
        params: finalParams,
        responseType: 'json',
      });
      if (res.status !== '0000') {
        throw new Error(res.msg);
      }
      return res.data;
    } catch (e) {
      return Promise.reject(e);
    }
  }
  async robotList() {
    const api = `${this.prefix}.robot.list.get`;
    try {
      const res = await this.request<Device[]>(api, {
        page_size: 10,
        p: 0,
      });
      return res;
    } catch (e: any) {
      console.log(e);
      return [];
    }
  }
  async revokeMsg(
    robot: string,
    toUser: string,
    msgId: string,
    newMsgId: string,
    msgTime: string
  ) {
    const api = `${this.prefix}.robot.revoke.msg`;
    const data = {
      wx_id: toUser,
      message_id: msgId,
      new_message_id: newMsgId,
      created_time: msgTime,
      robot_id: robot,
    };
    try {
      const res = await this.request<MsgRet>(api, data);
      return res;
    } catch (e) {
      console.log(e);
    }
  }
  private async sendMsg(api: string, body: Record<string, any>) {
    try {
      const res = await this.request<MsgRet>(api, body);
      if (res.message_id && res.new_message_id) {
        return this.wrapSuccess(res);
      }
      throw new Error('发送失败');
    } catch (e) {
      return this.wrapError(e.msg);
    }
  }
  async sendText(robot, toUser, content, extra = '') {
    const api = `${this.prefix}.robot.macsend.text`;
    if (extra.length && extra.split('&at=')?.length) {
      return this.groupAtText(robot, toUser, content, extra);
    }
    return this.sendMsg(api, {
      robot_id: robot,
      toWxId: toUser,
      ant: '',
      content: content,
    });
  }
  async groupAtText(robot, toUser, content, extra = '') {
    const at = extra.split('&at=')?.[1];
    const api = `${this.prefix}.robot.macgroup.at`;
    const data = {
      robot_id: robot,
      wx_id: toUser,
      ant: at,
      content: content,
    };
    return this.sendMsg(api, data);
  }
  async sendImage(robot, toUser, imageUrl) {
    const api = `${this.prefix}.robot.macsend.image`;
    return this.sendMsg(api, {
      robot_id: robot,
      toWxId: toUser,
      pic_url: imageUrl,
    });
  }
  async sendImageBase64(robot, toUser, base64) {
    const api = `${this.prefix}.robot.macsend.base64`;
    return this.sendMsg(api, {
      robot_id: robot,
      toWxId: toUser,
      base64_data: base64,
    });
  }
  async sendLink(
    robot: string,
    toUser: string,
    title: string,
    url: string,
    description: string,
    thumbUrl: string
  ) {
    const api = `${this.prefix}.robot.macsend.card`;
    try {
      const res = await this.request<LinkRet>(api, {
        robot_id: robot,
        wx_id: toUser,
        title,
        url,
        description,
        thumbUrl,
      });
      if (res.code === '1000') {
        return this.wrapSuccess(res.data);
      }
      throw new Error('发送失败');
    } catch (e) {
      return this.wrapError(e.msg);
    }
  }
  async sendVideo(
    robot: string,
    toUser: string,
    video_url: string,
    thumb_url: string
  ) {
    const api = `${this.prefix}.robot.macsend.video`;
    return this.sendMsg(api, {
      robot_id: robot,
      toWxId: toUser,
      video_url,
      thumb_url,
    });
  }
  async sendGif(robot, toUser, url: string) {
    const api = `${this.prefix}.robot.send.gif`;
    return this.sendMsg(api, {
      robot_id: robot,
      to: toUser,
      url,
    });
  }
  async sendMini(
    robotId,
    toUser,
    display_name,
    icon_url,
    id,
    page_path,
    thumb_url,
    title,
    user_name
  ) {
    const api = `${this.prefix}.robot.send.app`;
    return this.sendMsg(api, {
      robot_id: robotId,
      to_wx_id: toUser,
      display_name, //小程序的名称，例如：京东
      icon_url, // 发送小程序卡片时候缩略图的url
      id, //小程序的appID,例如：wx7c544xxxxxx
      page_path, //点击小程序卡片跳转的url
      thumb_url, //发送小程序卡片时候缩略图的url
      title, // 标题
      user_name, //小程序所有人的ID,例如：gh_1c0daexxxx@app
    });
  }
  async tranImage(robotId: string, toUser: string, content: string) {
    const api = `${this.prefix}.robot.macsend.recvimage`;
    return this.sendMsg(api, {
      robot_id: robotId,
      wx_id: toUser,
      content,
    });
  }
  async tranVideo(robotId, toUser, content) {
    const api = `${this.prefix}.robot.macsend.recvviedo`;
    return this.sendMsg(api, {
      robot_id: robotId,
      wx_id: toUser,
      content,
    });
  }
  async tranEmoji(robotId: string, toUser: string, xml: string) {
    const json = await this.xml2Json(xml);
    const md5 = json.msg.emoji[0].$.md5;
    const size = json.msg.emoji[0].$.len;
    const api = `${this.prefix}.robot.macsend.emoji`;
    return this.sendMsg(api, {
      robot_id: robotId,
      wx_id: toUser,
      image_md5: md5,
      image_size: size,
    });
  }
  async sendTimelineXml(robot, xmlContent: string, comments: string[] = []) {
    const api = `${this.prefix}.robot.macrepeat.circle`;
    const res = await this.request<{
      object: {
        id: string;
        userName: string;
        createTime: string;
      };
    }>(api, {
      robot_id: robot,
      content: xmlContent,
    });
    const {
      object: { id, userName },
    } = res;
    for (let i = 0; i < comments.length; i++) {
      await this.timelineComment(robot, userName, id, comments[i]);
      await this.sleep(2000);
    }
    return res;
  }
  async sendTimeline(
    robot,
    content: string,
    imageList: string[] = [],
    comments: string[] = [],
    black_list: string = '',
    group_user: string = ''
  ) {
    const api = `${this.prefix}.robot.macsend.circle`;
    const body = {
      robot_id: robot,
      content: content,
      pic_url: imageList.join(';'),
    };
    if (black_list) {
      body['black_list'] = black_list;
    }
    if (group_user) {
      body['group_user'] = group_user;
    }
    const res = await this.request<{
      object: {
        id: string;
        userName: string;
        createTime: string;
      };
    }>(api, body);
    const {
      object: { id, userName },
    } = res;
    for (let i = 0; i < comments.length; i++) {
      await this.timelineComment(robot, userName, id, comments[i]);
      await this.sleep(2000);
    }
    return res;
  }
  async sendTimelinePureByRobotList(
    robotIdList: string[],
    content: string,
    imageList: string[],
    comments: string[]
  ) {
    const results = await Promise.all(
      robotIdList.map(async (robotId) => {
        const res = await this.sendTimeline(
          robotId,
          content,
          imageList,
          comments
        );
        return res.object.id ? 'success' : 'error';
      })
    );
    const successCount = results.filter(
      (result) => result === 'success'
    ).length;
    const errorCount = results.filter((result) => result === 'error').length;
    return {
      successCount,
      errorCount,
    };
  }
  async timelineComment(
    robot: string,
    wxId: string,
    msgId: string,
    content: string,
    comment_id = 0
  ) {
    const api = `${this.prefix}.robot.macsend.circlecomment`;
    const res = await this.request<any>(api, {
      robot_id: robot,
      wx_id: wxId,
      msg_id: msgId,
      content: content,
      comment_id: comment_id,
    });
    return res;
  }
  async getSelfTimeline(robotId: string) {
    const api = `${this.prefix}.robot.macget.circle`;
    try {
      const res = await this.request<{
        sns: TimelineItem[];
      }>(api, {
        robot_id: robotId,
        max_id: 0,
        firstPage_md5: '',
      });
      return res.sns;
    } catch (e) {
      console.log(e);
      return [];
    }
  }
  async getFriendTimeline(
    robotId: string,
    target: string,
    maxId: number = 0,
    firstPageMd5: string = ''
  ) {
    const api = `${this.prefix}.robot.macget.firendcircle`;
    try {
      const res = await this.request<{
        sns: TimelineItem[];
      }>(api, {
        robot_id: robotId,
        wx_id: target,
        max_id: maxId,
        firstPage_md5: firstPageMd5,
      });
      return res.sns;
    } catch (e) {
      console.log(e);
      return [];
    }
  }
  async getLatestTimeline(robot: string, friendWxid: string) {
    const ret: TimelineParsedItem[] = [];
    const res = await this.getFriendTimeline(robot, friendWxid);
    if (res.length) {
      const item = res[0];
      const comments = item.snsComments.map((it) => it.content);
      const content: any = await this.xml2Json(item.objectDesc.xml);
      const pic =
        content?.TimelineObject?.ContentObject[0]?.mediaList[0]?.media?.map(
          (med) => med.url[0]._
        );
      const timelineId = content?.TimelineObject?.id[0];
      const author = content?.TimelineObject?.username[0];
      const createTime = content?.TimelineObject?.createTime * 1000;
      ret.push({
        comment: JSON.stringify(comments || ''),
        content: content?.TimelineObject?.contentDesc?.[0],
        pic: JSON.stringify(pic || ''),
        timeline_id: timelineId,
        author,
        third_time: dayjs(createTime).format('YYYY-MM-DD HH:mm:ss'),
      });
    }
    return ret.length ? ret[0] : null;
  }
  async getLatestTimelineOrigin(robot: string, friendWxid: string) {
    const res = await this.getFriendTimeline(robot, friendWxid);
    const ret: TimelineOrigin[] = [];
    if (res.length) {
      const item = res[0];
      const comments = item.snsComments.map((it) => it.content);
      const content: any = await this.xml2Json(item.objectDesc.xml);
      const r = {
        comments,
        content: content?.TimelineObject?.contentDesc?.[0],
        xml: item.objectDesc.xml,
      };
      ret.push(r);
    }
    return ret;
  }
  async getGroupInfo(robot: string, roomId: string) {
    const api = `${this.prefix}.robot.room.detail`;
    const res = await this.request<ChatRoom[]>(api, {
      robot_id: robot,
      room_id: roomId,
    });
    return res;
  }
  async getGroupMember(robotId: string, roomId: string) {
    const api = `${this.prefix}.robot.macget.chatroommember`;
    const res = await this.request<RoomMember[]>(api, {
      robot_id: robotId,
      room_id: roomId,
    });
    const _res: GroupMember[] = res.map((item) => ({
      wxid: item.userName,
      invite: item.inviterUserName,
      name2: item.displayName,
      name1: item.nickName,
      big: item.bigHeadImgUrl,
      small: item.smallHeadImgUrl,
    }));
    return _res;
  }
  /**
   *
   * @param robot
   * @param roomId
   * @param memberId  删除的群成员微信号，多个已 "," 分割
   * @returns
   */
  async kickMember(robot: string, roomId: string, memberId: string) {
    const api = `${this.prefix}.robot.room.delmember`;
    const data = {
      robot_id: robot,
      room_id: roomId,
      user_list: memberId,
    };
    try {
      await this.request(api, data);
      return 1;
    } catch (e) {
      console.log(e);
      return 0;
    }
  }
  async roomNotice(robot: string, roomId: string, content: string) {
    const api = `${this.prefix}.robot.room.notice`;
    const data = {
      robot_id: robot,
      room_id: roomId,
      content,
    };
    try {
      await this.request(api, data);
      return 1;
    } catch (e) {
      console.log(e);
      return 0;
    }
  }
  async getContactInfo(robotId: string, wxid: string) {
    const api = `${this.prefix}.robot.friend.detail`;
    const data = {
      robot_id: robotId,
      wx_id: wxid,
    };
    const res = await this.request<ContactInfo[]>(api, data);
    return res;
  }
  async getSelfInfo(robotId: string) {
    const api = `${this.prefix}.robot.detail.get`;
    const res = await this.request<RobotInfo>(api, {
      robot_id: robotId,
    });
    return res;
  }
  async getContact(
    robotId,
    wx_contact_seq?: number,
    room_contact_seq?: number
  ) {
    const api = `${this.prefix}.robot.get.contract`;
    const data: any = {
      robot_id: robotId,
    };
    if (wx_contact_seq) {
      data.wx_contact_seq = wx_contact_seq;
    }
    if (room_contact_seq) {
      data.room_contact_seq = room_contact_seq;
    }
    const res = await this.request<string[]>(api, data);
    const rooms = res.filter((item) => item.endsWith('@chatroom'));
    const users = res.filter((item) => {
      return !item.endsWith('@chatroom') && !item.startsWith('gh_');
    });
    const ghs = res.filter((item) => item.startsWith('gh_'));
    return {
      rooms,
      users,
      ghs,
    };
  }
  async leaveRoom(robot: string, roomId: string) {
    const api = `${this.prefix}.robot.group.delete`;
    try {
      await this.request(api, {
        robot_id: robot,
        room_id: roomId,
      });
      return 1;
    } catch (e) {
      return 0;
    }
  }
  async login(robot: string) {
    const api = `${this.prefix}.robot.qrcode.maclogin`;
    const res = await this.request<{
      wId: string;
      qrCodeUrl: string;
      expiredTime: string;
      province: string;
      city: string;
    }>(api, {
      robot_id: robot,
    });
    return res;
  }
  async checkLogin(robot: string, wId: string) {
    const api = `${this.prefix}.robot.async.mlogin`;
    try {
      const res = await this.request<CheckLogin>(api, {
        robot_id: robot,
        wId,
      });
      return res;
    } catch (e) {
      return null;
    }
  }
  async offline(robot: string) {
    const api = `${this.prefix}.robot.force.offline`;
    try {
      const res = await this.request(api, {
        robot_id: robot,
      });
      return 1;
    } catch (e) {
      return 0;
    }
  }
  async lableList(robot: string) {
    const api = `${this.prefix}.robot.label.list`;
    const res = await this.request<
      {
        labelName: string;
        labelId: string;
      }[]
    >(api, {
      robot_id: robot,
    });
    return res;
  }
}
