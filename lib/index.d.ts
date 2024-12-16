import type { Device, MsgRet, TimelineItem, TimelineParsedItem, TimelineOrigin, ChatRoom, GroupMember, ContactInfo, RobotInfo, CheckLogin } from './type';
export default class WechatService {
    private prefix;
    private appKey;
    private secret;
    private client;
    private apiUrl;
    private partnerId;
    private domain;
    private axios;
    constructor(prefix: string, appKey: string, secret: string, client: string, apiUrl: string, partnerId: string, domain: string);
    md5(ipt: string): string;
    sleep(timeout: number): Promise<unknown>;
    wrapSuccess(data: any): {
        status: number;
        data: any;
    };
    wrapError(e: any): {
        status: number;
        error: any;
    };
    private xml2Json;
    private sign;
    private request;
    robotList(): Promise<Device[]>;
    revokeMsg(robot: string, toUser: string, msgId: string, newMsgId: string, msgTime: string): Promise<MsgRet>;
    private sendMsg;
    sendText(robot: any, toUser: any, content: any, extra?: string): Promise<{
        status: number;
        data: any;
    } | {
        status: number;
        error: any;
    }>;
    groupAtText(robot: any, toUser: any, content: any, extra?: string): Promise<{
        status: number;
        data: any;
    } | {
        status: number;
        error: any;
    }>;
    sendImage(robot: any, toUser: any, imageUrl: any): Promise<{
        status: number;
        data: any;
    } | {
        status: number;
        error: any;
    }>;
    sendImageBase64(robot: any, toUser: any, base64: any): Promise<{
        status: number;
        data: any;
    } | {
        status: number;
        error: any;
    }>;
    sendLink(robot: string, toUser: string, title: string, url: string, description: string, thumbUrl: string): Promise<{
        status: number;
        data: any;
    } | {
        status: number;
        error: any;
    }>;
    sendVideo(robot: string, toUser: string, video_url: string, thumb_url: string): Promise<{
        status: number;
        data: any;
    } | {
        status: number;
        error: any;
    }>;
    sendGif(robot: any, toUser: any, url: string): Promise<{
        status: number;
        data: any;
    } | {
        status: number;
        error: any;
    }>;
    sendMini(robotId: any, toUser: any, display_name: any, icon_url: any, id: any, page_path: any, thumb_url: any, title: any, user_name: any): Promise<{
        status: number;
        data: any;
    } | {
        status: number;
        error: any;
    }>;
    tranImage(robotId: string, toUser: string, content: string): Promise<{
        status: number;
        data: any;
    } | {
        status: number;
        error: any;
    }>;
    tranVideo(robotId: any, toUser: any, content: any): Promise<{
        status: number;
        data: any;
    } | {
        status: number;
        error: any;
    }>;
    tranEmoji(robotId: string, toUser: string, xml: string): Promise<{
        status: number;
        data: any;
    } | {
        status: number;
        error: any;
    }>;
    sendTimelineXml(robot: any, xmlContent: string, comments?: string[]): Promise<{
        object: {
            id: string;
            userName: string;
            createTime: string;
        };
    }>;
    sendTimeline(robot: any, content: string, imageList?: string[], comments?: string[], black_list?: string, group_user?: string): Promise<{
        object: {
            id: string;
            userName: string;
            createTime: string;
        };
    }>;
    sendTimelinePureByRobotList(robotIdList: string[], content: string, imageList: string[], comments: string[]): Promise<{
        successCount: number;
        errorCount: number;
    }>;
    timelineComment(robot: string, wxId: string, msgId: string, content: string, comment_id?: number): Promise<any>;
    getSelfTimeline(robotId: string): Promise<TimelineItem[]>;
    getFriendTimeline(robotId: string, target: string, maxId?: number, firstPageMd5?: string): Promise<TimelineItem[]>;
    getLatestTimeline(robot: string, friendWxid: string): Promise<TimelineParsedItem>;
    getLatestTimelineOrigin(robot: string, friendWxid: string): Promise<TimelineOrigin[]>;
    getGroupInfo(robot: string, roomId: string): Promise<ChatRoom[]>;
    getGroupMember(robotId: string, roomId: string): Promise<GroupMember[]>;
    /**
     *
     * @param robot
     * @param roomId
     * @param memberId  删除的群成员微信号，多个已 "," 分割
     * @returns
     */
    kickMember(robot: string, roomId: string, memberId: string): Promise<1 | 0>;
    roomNotice(robot: string, roomId: string, content: string): Promise<1 | 0>;
    getContactInfo(robotId: string, wxid: string): Promise<ContactInfo[]>;
    getSelfInfo(robotId: string): Promise<RobotInfo>;
    getContact(robotId: any, wx_contact_seq?: number, room_contact_seq?: number): Promise<{
        rooms: string[];
        users: string[];
        ghs: string[];
    }>;
    leaveRoom(robot: string, roomId: string): Promise<1 | 0>;
    login(robot: string): Promise<{
        wId: string;
        qrCodeUrl: string;
        expiredTime: string;
        province: string;
        city: string;
    }>;
    checkLogin(robot: string, wId: string): Promise<CheckLogin>;
    offline(robot: string): Promise<1 | 0>;
    labelList(robot: string): Promise<{
        labelName: string;
        labelId: string;
    }[]>;
}
