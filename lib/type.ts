export type MsgRet = {
  ret: '0' | '1';
  count: string;
  message_id: string;
  new_message_id: string;
};
export type Device = {
  id: number;
  uid: number;
  wechatrobot: string;
  wx_id: string;
  amount_used: number;
  group_num: number;
  passwd: string;
  nickname: string;
  c_uid: number;
  login_status: number;
  end_time: number;
  remark: string;
  wc_id: string;
  agent_uid: number;
  is_enabled: number;
};

export type TimelineObj = {
  xml: string;
  len: number;
};

export type TimelineComment = {
  comment_id: string;
  reply_comment_id: string;
  wx_id: string;
  content: string;
  create_time: string;
  nickname: string;
  type: string;
  comment_flag: string;
  delete_flag: string;
  is_not_rich_text: string;
};

export type TimelineLike = {
  wx_id: string;
  nickname: string;
  type: string;
  create_time: string;
  comment_id: string;
  comment_flag: string;
  reply_comment_id: string;
  delete_flag: string;
  is_not_rich_text: string;
  content: string;
};

export type TimelineItem = {
  id: string;
  userName: string;
  nickName: string;
  createTime: string;
  objectDesc: TimelineObj;
  likeCount: string;
  snsLikes: TimelineLike[];
  commentCount: string;
  snsComments: TimelineComment[];
};

export type TimelineParsedItem = {
  comment: string;
  content: string;
  pic: string;
  timeline_id: string;
  author: string;
  third_time: string;
};

export type TimelineOrigin = {
  comments: string[];
  content: string;
  xml: string;
};

type ExtOrg = {
  id: string;
  wx_id: string;
  nick_name: string;
  owner: string;
  member_num: string;
  head_small_image_url: string;
  status: string;
  admins: string[];
  members: string[];
  dismissed: boolean;
  flag: string;
};

export type ChatRoom = {
  chatRoomId: string;
  nickName: string;
  chatRoomOwner: string;
  memberCount: string;
  bigHeadImgUrl: string;
  smallHeadImgUrl: string;
  chatRoomMembers: any[];
  v1: string;
  extOrg: ExtOrg;
};

export type GroupMember = {
  wxid: string;
  invite: string;
  name2: string | null; // 群昵称
  name1: string;
  big?: string;
  small?: string;
};
// 微信返回的群成员类型
export type RoomMember = {
  chatRoomId: string;
  userName: string;
  nickName: string;
  displayName: string;
  bigHeadImgUrl: string;
  smallHeadImgUrl: string;
  inviterUserName: string;
  friend: boolean;
  isAdmin: boolean;
  sex: string;
};

export type ImageMsgExtension = {
  aes_key: string;
  file_id: string;
  mid_img_length: string;
  thumb_img_length: string;
  thumb_width: string;
  thumb_height: string;
  md5: string;
};

export type LinkRet = {
  code: string;
  data: {
    ret: string;
    count: string;
    message_id: string;
    new_message_id: string;
    extension: {
      title: string;
      desc: string;
      url: string;
      thumb_file_id: string;
      thumb_file_length: string;
      thumb_file_aes_key: string;
      thumb_file_md5: string;
    };
  };
};

export type ContactInfo = {
  userName: string;
  nickName: string;
  weixin: string;
  aliasName: string;
  bigHead: string;
  smallHead: string;
  remark: string | null;
  v1: string;
  sex: string;
  country: string;
  province: string;
  city: string;
  signature: string;
  labelList: string;
  isFriend: boolean;
};

export type RobotInfo = {
  id: number;
  uid: number;
  wechatrobot: string;
  avatar: string;
  wx_id: string;
  province: string;
  city: string;
  pro_code: string;
  city_code: string;
  amount_used: number;
  nickname: string;
  c_uid: number;
  login_status: number;
  end_time: number;
  remark: string;
  wc_id: string;
  agent_uid: number;
  is_enabled: number;
  robot_type: number;
  is_new: number;
  oem_id: number;
  client_type: number;
  heart_timer_id: number;
  sync_timer_id: number;
  circle_open: number;
  is_log: number;
};

export type CheckLogin = {
  wcId: string;
  headUrl: string;
  smallHeadImgUrl: string;
  nickName: string;
  wAccount: string;
  wId: string;
};
