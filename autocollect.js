var __dirname = import.meta.url.replace(/\/[^\/]*$/, '').split('file:///').join('').split('%20').join(' ').split('/').join('\\');
export default {
    name: "autocollect",
    role: "admin",
    delay: 0,
    description: "Auto collect images from group and send to box",
    author: "Kaguya Team",
    alias: ["autocollect", "ac"],
    load: async ({ bot }) => {
        if (!fs.existsSync(__dirname + "/collect")) fs.mkdirSync(__dirname + "/collect");
        if (!bot.config.data.autocollect) bot.config.data.autocollect = {
            enable: false,
            TIDCollect: [],
            TIDSend: [],
            type: "photo"
        };
        bot.config.save(bot.config.data);
    },
    cmd: async ({ args, kaguya, bot, event }) => {
        if (args[0] == "active") {
            bot.config.data.autocollect.enable = !bot.config.data.autocollect.enable ? true : false;
            bot.config.save(bot.config.data);
            return kaguya.reply(`Đã ${bot.config.data.autocollect.enable ? "bật" : "tắt"} chế độ tự động thu thập ảnh!`);
        }
        kaguya.reply("1.Quản lý box thu thập ảnh!\n2.Quản lý box nhận ảnh\n3.Xem trạng thái", function (_err, info) {
            bot.reply.set(info.messageID, {
                name: 'autocollect',
                type: 'buttons',
                author: event.senderID
            });
        });
    },
    reply: async ({ api, event, kaguya, bot, reply }) => {
        if (event.senderID != reply.author) return;
        switch (reply.type) {
            case "buttons":
                switch (event.body) {
                    case "1":
                        kaguya.reply("1.Thêm box thu thập ảnh\n2.Xóa box thu thập ảnh\n3.Xem danh sách box thu thập ảnh", function (_err, info) {
                            bot.reply.set(info.messageID, {
                                name: 'autocollect',
                                type: 'tidCollect',
                                author: event.senderID
                            });
                        });
                        break;
                    case "2":
                        kaguya.reply("1.Thêm box nhận ảnh\n2.Xóa box nhận ảnh\n3.Xem danh sách box nhận ảnh", function (_err, info) {
                            bot.reply.set(info.messageID, {
                                name: 'autocollect',
                                type: 'tidSend',
                                author: event.senderID
                            });
                        });
                        break;
                    case "3":
                        kaguya.reply(`Trạng thái: ${bot.config.data.autocollect.enable ? "Bật" : "Tắt"}\nLoại ảnh: ${bot.config.data.autocollect.type}\nBox thu thập: ${bot.config.data.autocollect.TIDCollect.length}\nBox nhận: ${bot.config.data.autocollect.TIDSend.length}`);
                        break;
                    default:
                        kaguya.reply("Lựa chọn không hợp lệ!");
                }
                break;
            case "tidCollect":
                switch (event.body) {
                    case "1":
                        var inbox = await api.getThreadList(100, null, ['INBOX']);
                        let list = [...inbox].filter(group => group.isSubscribed && group.isGroup); // Lọc box
                        var arr = [],
                            msg = ``;
                        list.forEach(group => {
                            arr.push({
                                title: group.name,
                                payload: group.threadID
                            });
                        });
                        arr.map((e, i) => msg += `${i + 1}. ${e.title} (${e.payload})\n`);
                        kaguya.reply(msg + "Reply số thứ tự box muốn thêm!", function (_err, info) {
                            bot.reply.set(info.messageID, {
                                name: 'autocollect',
                                type: 'tidCollectAdd',
                                allTID: arr,
                                author: event.senderID
                            });
                        });
                        break;
                    case "2":
                        kaguya.reply(bot.config.data.autocollect.TIDCollect.join("\n") + "\nReply số thứ tự box muốn xóa!", function (_err, info) {
                            bot.reply.set(info.messageID, {
                                name: 'autocollect',
                                type: 'tidCollectDelete',
                                author: event.senderID
                            });
                        });
                        break;
                    case "3":
                        kaguya.reply(bot.config.data.autocollect.TIDCollect.length ? bot.config.data.autocollect.TIDCollect.join("\n") : "Không có box nào!");
                        break;
                    default:
                        kaguya.reply("Lựa chọn không hợp lệ!");
                }
                break;
            case "tidCollectAdd":
                if (isNaN(event.body) || event.body > reply.allTID.length) return kaguya.reply("Lựa chọn không hợp lệ!");
                if (bot.config.data.autocollect.TIDCollect.includes(reply.allTID[event.body - 1].payload)) return kaguya.reply("Box đã tồn tại!");
                bot.config.data.autocollect.TIDCollect.push(reply.allTID[event.body - 1].payload);
                bot.config.save(bot.config.data);
                kaguya.reply(`Đã thêm box ${reply.allTID[event.body - 1].title}!`);
                break;
            case "tidCollectDelete":
                var allTID = bot.config.data.autocollect.TIDCollect,
                    idDelete = allTID[event.body - 1];
                if (isNaN(event.body) || event.body > allTID.length) return kaguya.reply("Lựa chọn không hợp lệ!");
                bot.config.data.autocollect.TIDCollect.splice(event.body - 1, 1);
                bot.config.save(bot.config.data);
                kaguya.reply(`Đã xóa box ${idDelete}!`);
                break;
            case "tidSend":
                switch (event.body) {
                    case "1":
                        kaguya.reply("Nhập ID box muốn thêm!", function (_err, info) {
                            bot.reply.set(info.messageID, {
                                name: 'autocollect',
                                type: 'tidSendAdd',
                                author: event.senderID,
                                tidSend: event.body
                            });
                        });
                        break;
                    case "2":
                        var allIDSend = bot.config.data.autocollect.TIDSend;
                        allIDSend.map((e, i) => msg += `${i + 1}. ${e} \n`);
                        kaguya.reply(msg + "Reply số thứ tự box muốn xóa!", function (__err, info) {
                            bot.reply.set(info.messageID, {
                                name: 'autocollect',
                                type: 'tidSendDelete',
                                author: event.senderID,
                                allIDSend: allIDSend
                            });
                        });
                        break;
                    case "3":
                        kaguya.reply(bot.config.data.autocollect.TIDSend.length ? bot.config.data.autocollect.TIDSend.join("\n") : "Không có box nào!");
                        break;
                    default:
                        kaguya.reply("Lựa chọn không hợp lệ!");
                }
                break;
            case "tidSendAdd":
                if (isNaN(event.body)) return kaguya.reply("ID không hợp lệ!");
                if (bot.config.data.autocollect.TIDSend.includes(event.body)) return kaguya.reply("Box đã tồn tại!");
                bot.config.data.autocollect.TIDSend.push(event.body);
                bot.config.save(bot.config.data);
                kaguya.reply(`Đã thêm box ${event.body}!`);
                break;
            case "tidSendDelete":
                var allIDSend = bot.config.data.autocollect.TIDSend;
                if (isNaN(event.body) || event.body > allIDSend.length) return kaguya.reply("Lựa chọn không hợp lệ!");
                bot.config.data.autocollect.TIDSend.splice(event.body - 1, 1);
                bot.config.save(bot.config.data);
                kaguya.reply(`Thành công!`);
                break;
        }
    },
    events: async ({ event, kaguya, bot, api }) => {
        if (bot.config.data.autocollect.TIDCollect.includes(event.threadID) && event.type == "message" || event.type == "message_reply" && event.attachments.length > 0 && event.senderID != api.getCurrentUserID() && bot.config.data.autocollect.TIDSend.length > 0 && bot.config.data.autocollect.enable == true) {
            var IDAttachment = new Object(),
                getArrayBuffer = [];
            event.attachments.forEach(attachment => attachment.type == "photo" ? IDAttachment[attachment["ID"]] = attachment.url : "");
            if (Object.keys(IDAttachment).length > 0) {
                for (const [id, url] of Object.entries(IDAttachment)) {
                    kaguya.fetch(url, {
                        method: 'get',
                        responseType: 'arraybuffer'
                    }).then(async res => {
                        var path = __dirname + `/collect/${id}.png`;
                        fs.writeFileSync(path, Buffer.from(res.data, 'binary'));
                        getArrayBuffer.push(fs.createReadStream(path));
                        if (getArrayBuffer.length == Object.keys(IDAttachment).length) {
                            bot.config.data.autocollect.TIDSend.forEach(async e => {
                                await kaguya.send({
                                    body: `Từ: ${event.threadID} \n${event.body}`,
                                    attachment: getArrayBuffer
                                }, e);
                            });
                        }
                    }).catch(err => console.log(err));
                }
            }
        }
    }
};
import fs from "fs";
