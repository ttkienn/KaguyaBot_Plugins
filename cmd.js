import fs from "fs";

class Cmd {
    name = "cmd";
    role = "member";
    delay = 5;
    descriptions = "Load lại plugins";
    author = "Thiệu Trung Kiên";
    async cmd({ args, bot }) {
        try {
            const name = args[1];
            switch (args[0]) {
                case "reload":
                    await this.reloadPlugins(bot);
                    break;
                case "load":
                    await this.loadPlugin(name, bot);
                    break;
                case "unload":
                    await this.unloadPlugin(name, bot);
                    break;
                default:
                    reply(`Sai Cú Pháp!\nSử dụng: ${bot.config.data.prefix}cmd <reload|load|unload> <tên file>`);
            }
        } catch (e) {
            reply("Đã xảy ra lỗi, vui lòng thử lại sau!" + e);
        }
    }

    async reloadPlugins(bot) {
        delete bot.plugins;
        bot.plugins = [];

        const files = fs.readdirSync("./plugins");
        for (const file of files) {
            if (file.endsWith(".js") && file !== "example.js") {
                const plugin = await this.reloadImport(`./${file}`);
                bot.plugins.push(plugin);
            }
        }

        reply("Loaded all plugins!");
    }

    async loadPlugin(name, bot) {
        const fileName = name.endsWith(".js") ? name : `${name}.js`;
        if (!fs.existsSync(`./plugins/${fileName}`)) {
            return reply(`Không tìm thấy file ${fileName}!`);
        }

        const pluginName = fileName.replace(".js", "");
        const index = bot.plugins.findIndex((plugin) => plugin.name === pluginName);
        if (index > -1) {
            bot.plugins.splice(index, 1);
        }

        const plugin = await this.reloadImport(`./${fileName}`);
        bot.plugins.push(plugin);

        reply(`Loaded: ${fileName}`);
    }

    async unloadPlugin(name, bot) {
        const fileName = name.endsWith(".js") ? name : `${name}.js`;
        if (!fs.existsSync(`./plugins/${fileName}`)) {
            return reply(`Không tìm thấy file ${fileName}!`);
        }

        const pluginName = fileName.replace(".js", "");
        const plugin = bot.plugins.find((plugin) => plugin.name === pluginName);
        if (!plugin) {
            return reply("Plugin not found!");
        }

        const index = bot.plugins.indexOf(plugin);
        bot.plugins.splice(index, 1);

        reply(`Unloaded: ${fileName}`);
    }

    async reloadImport(path) {
        return (await import(`${path}?version=${Date.now()}`)).default;
    }
}

export default new Cmd();

