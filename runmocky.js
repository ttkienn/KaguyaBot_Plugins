import { readFile } from "fs";
import axios from "axios";

class RunmockyCommand {
  name = "runmocky";
  role = "admin";
  author = "Thiệu Trung Kiên";
  description = "Upload something!";
  delay = 5;

  async cmd({ api, event, args, reply }) {
    if (!args.join(" ")) {
      return reply("Missing data!");
    }

    const fileExtension = args.join(" ").split(".").pop();
    if (fileExtension !== "js" && fileExtension !== "json") {
      return reply(`Invalid file type "${fileExtension}".`);
    }

    const filePath = `./plugins/${args.join(" ")}`;
    try {
      const fileContent = await readFile(filePath, "utf-8");
      const response = await axios.post("https://api.mocky.io/api/mock", {
        status: 200,
        content: fileContent,
        content_type: "application/json",
        charset: "UTF-8",
        secret: "ThieuTrungKien",
        expiration: "never",
      });
      const link = response.data.link;
      console.log(link);
      reply(`${link} `);
    } catch (error) {
      reply(`Error: ${error.message}`);
    }
  }
}

export default new RunmockyCommand();
