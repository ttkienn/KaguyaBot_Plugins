import fs from "fs-extra";
export default {
	name: "autodown",
	role: "member",
	delay: 0,
	description: "Tự động tải video hoặc nhạc",
	author: "Thiệu Trung Kiên",
	load: async ({ bot }) => {
		bot.global.autodown || (bot.global.autodown || (bot.global.autodown = {}), bot.global.allThreadID.forEach((threadID => {
			bot.global.autodown[threadID] = "on"
		})))
	},
	cmd: async ({ kaguya, event, bot }) => {
		var autodown = bot.global.autodown;
		autodown[event.threadID] || (autodown[event.threadID] = "on"), "on" == autodown[event.threadID] ? autodown[event.threadID] = "off" : autodown[event.threadID] = "on", kaguya.reply(`Đã ${"on"==autodown[event.threadID]?"bật":"tắt"} chế độ tự động tải video hoặc nhạc!`)
	},
	events: async ({ kaguya, event, bot }) => {
		if (bot.global.autodown[event.threadID] || (bot.global.autodown[event.threadID] = "on"), "on" == bot.global.autodown[event.threadID] && matchUrl(event.body)) {
			var url = matchUrl(event.body);
			kaguya.fetch(`https://nguyenmanh.name.vn/api/autolink?url=${url}&apikey=X7qFMoKB`, {
				method: "GET"
			}).then((({ data }) => {
				var getUrl, { video, music } = data.result;
				getUrl = url.toString().includes("soundcloud") ? music.play_url : video.hd || video.sd || video.nowatermark || video.watermark, kaguya.fetch(getUrl, {
					responseType: "arraybuffer"
				}).then((body => {
					var ext = body.headers["content-type"].split("/")[1].replace("mpeg", "mp3"),
						path = `./plugins/cache/${event.threadID}_${event.senderID}_autodown.${ext}`;
					fs.writeFileSync(path, body.data), kaguya.reply({
						body: `Gõ "${bot.config.data.prefix}autodown" để tắt chế độ tự động tải video hoặc nhạc cho nhóm này!\nThreadID: ${event.threadID}`,
						attachment: fs.createReadStream(path)
					}, (() => {
						fs.unlinkSync(path)
					}))
				}))
			})).catch((err => console.log(err)))
		}
	}
};

function matchUrl(text) {
	for (var matchArray, source = (text || "").toString(), urlArray = [], regexToken = /(((https?|ftp):\/\/)|(www\.))(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/g; null !== (matchArray = regexToken.exec(source));) {
		var token = matchArray[0];
		urlArray.push(token)
	}
	return !!validateURL(urlArray[0]) && urlArray[0]
}

function validateURL(textval) {
	return new RegExp("^(http|https|ftp)://[a-zA-Z0-9-.]+.[a-zA-Z]{2,3}(:[a-zA-Z0-9]*)?/?([a-zA-Z0-9-._?,'/\\+&amp;%$#=~])*$").test(textval)
}
