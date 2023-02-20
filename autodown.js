import fs from "fs";
class AutoDown {
    name = "autodown";
    role = "member";
    delay = 0;
    description = "Tự động tải video hoặc nhạc";
    author = "Thiệu Trung Kiên";

    async load({ bot }) {
        bot.global.autodown || (
            bot.global.autodown || (bot.global.autodown = {}),
            bot.global.allThreadID.forEach(threadID => {
                bot.global.autodown[threadID] = "on"
            })
        )
    }

    async cmd({ event, bot }) {
        var autodown = bot.global.autodown;
        autodown[event.threadID] || (autodown[event.threadID] = "on");
        "on" == autodown[event.threadID] ? autodown[event.threadID] = "off" : autodown[event.threadID] = "on";
        reply(`Đã ${"on" == autodown[event.threadID] ? "bật" : "tắt"} chế độ tự động tải video hoặc nhạc!`);
    }

    async events({ event, bot }) {
        if (bot.global.autodown[event.threadID] || (bot.global.autodown[event.threadID] = "on"),
            "on" == bot.global.autodown[event.threadID] && this.matchUrl(event.body)) {
            var url = this.matchUrl(event.body);
            fetch(`https://nguyenmanh.name.vn/api/autolink?url=${url}&apikey=Fx82jKS`, {
                method: "GET"
            }).then(({ data }) => {
                var getUrl, { video, music } = data.result;
                getUrl = url.toString().includes("soundcloud") ? music.play_url : video.hd || video.sd || video.nowatermark || video.watermark;
                fetch(getUrl, {
                    responseType: "arraybuffer"
                }).then(body => {
                    var ext = body.headers["content-type"].split("/")[1].replace("mpeg", "mp3");
                    var path = `./plugins/cache/${event.threadID}_${event.senderID}_autodown.${ext}`;
                    fs.writeFileSync(path, body.data);
                    reply({
                        body: `Gõ "${bot.config.data.prefix}autodown" để tắt chế độ tự động tải video hoặc nhạc cho nhóm này!\nThreadID: ${event.threadID}`,
                        attachment: fs.createReadStream(path)
                    }, () => {
                        fs.unlinkSync(path)
                    })
                })
            }).catch(err => console.log(err))
        }
    }
    matchUrl(text) {
        const valid = ["facebook", "soundcloud", "tiktok", "spotify", "youtube", "zingmp3"];
        const source = (text || "").toString();
        const urlArray = [];
        const regexToken = /(((https?|ftp):\/\/)|(www\.))(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/g;

        let matchArray;
        while ((matchArray = regexToken.exec(source)) !== null) {
            const token = matchArray[0];
            urlArray.push(token);
        }

        if (urlArray.length && this.validateURL(urlArray[0])) {
            for (const validUrl of valid) {
                if (urlArray[0].includes(validUrl)) {
                    return urlArray[0];
                }
            }
        }

        return false;
    }
    validateURL(textval) {
        return new RegExp("^(http|https|ftp)://[a-zA-Z0-9-.]+.[a-zA-Z]{2,3}(:[a-zA-Z0-9]*)?/?([a-zA-Z0-9-._?,'/\\+&amp;%$#=~])*$").test(textval)
    }
}

export default new AutoDown();
