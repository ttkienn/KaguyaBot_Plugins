class HelpCommand {
  name = "help";
  role = "member";
  delay = 5;
  descriptions = "Xem danh sách các plugins";
  author = "Thiệu Trung Kiên";

  async cmd({ event, args, bot }) {
    const page = parseInt(args[0]) || 1;
    const maxPage = Math.ceil(bot.plugins.length / 5);
    const startIndex = 5 * (page - 1);
    const endIndex = Math.min(5 * page, bot.plugins.length);
    const plugins = bot.plugins.slice(startIndex, endIndex);

    if (args[0]) {
      const plugin = bot.plugins.find(plugin => plugin.name === args[0]);
      if (plugin) {
        const { name, author, descriptions, role, delay } = plugin;
        return reply(`Tên: ${name}\nTác giả: ${author}\nMô tả: ${descriptions}\nQuyền hạn: ${role}\nThời gian chờ: ${delay}\n`);
      }
      return reply("Không tìm thấy plugin này!");
    }

    const message = plugins.map((plugin, index) => {
      const { name, author, descriptions, role, delay } = plugin;
      return `${index + 1 + startIndex}. ${name} (${role})\n${descriptions}\nTác giả: ${author}\nThời gian chờ: ${delay} giây`;
    }).join("\n\n");

    const replyMessage = `Danh sách các plugins (${page}/${maxPage}): \n${message}\n\nSử dụng ${bot.config.data.prefix}help <tên plugin> để xem chi tiết!\nSử dụng ${bot.config.data.prefix}help <số trang> để xem trang tiếp theo!`;
    reply(replyMessage, (err, info) => {
      bot.reply.set(info?.messageID, {
        type: "help",
        name: "help",
        dataPlugins: plugins,
        author: event.senderID,
      });
    });
  }

  async reply({ event, bot }) {
    if (!onReply || onReply.author !== event.senderID) return reply("Bạn không phải người gửi tin nhắn này!");
    const index = parseInt(event.body) - 1;
    const plugin = onReply.dataPlugins?.[index];
    if (!plugin) return reply("Không tìm thấy plugin này!");
    const { name, author, descriptions, role, delay } = plugin;
    if (onReply.type === "help") return reply(`Tên: ${name}\nTác giả: ${author}\nMô tả: ${descriptions}\nQuyền hạn: ${role}\nThời gian chờ: ${delay}\n`);
  }
}

export default new HelpCommand();
