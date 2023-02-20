class Example {
  name = "example"; // Tên plugins
  role = "member"; // Quyền hạn
  delay = 5; // Thời gian chờ
  author = "Thiệu Trung Kiên"; // Tác giả
  descriptions = "Example Plugins Kaguya Bot"; // Mô tả cho plugins
  aliases = ["ex"]; // Các tên khác

  load() {
    // body
  }

  cmd = async ({ api, event, args, Users, Threads, bot }) => {
    // body
  }

  reply = async ({ api, event, args, Users, Threads, bot }) => {
    // body
  }

  reaction = async ({ api, event, args, Users, Threads, bot }) => {
    // body
  }

  events = async ({ api, event, args, Users, Threads, bot }) => {
    // body
  }
}

export default new Example();
