const TelegramApi = require("node-telegram-bot-api");

const token = "5982640356:AAEhL1azXkVJmA0I2VqHiB-aVDcVJCCX0gM";

const bot = new TelegramApi(token, { polling: true });

const users = {};

const a = async (chatId) => {
  users[chatId] = users[chatId] || {
    money: 0,
  };
  return bot.sendMessage(
    chatId,
    "*Регистрация почти завершена! 😎*\n\nЧтобы начать зарабатывать необходимо быть подписанным на следующие спонсорские каналы 📩",
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Подписаться",
              callback_data: "subscribe",
            },
          ],
          [
            {
              text: "Заработать",
              callback_data: "makemoney",
            },
          ],
        ],
      },
      parse_mode: "Markdown",
    }
  );
};

const start = async () => {
  bot.on("message", async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;
    if (text === "/start") {
      return a(chatId);
    }
    return bot.sendMessage(
      chatId,
      "Я тебя не понимаю долбоеб, попробуй еще раз!)"
    );
  });

  bot.on("callback_query", async (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;
    if (data === "/start") {
      return a(chatId);
    }
    if (data === "subscribe") {
      return bot.sendMessage(chatId, "Ай иди ты нахуй");
    }
    if (data === "makemoney") {
      await bot.sendPhoto(
        chatId,
        `https://fakeface.rest/face/view?a=${new Date()}`
      );
      return bot.sendMessage(chatId, "Это мужчина или женщина? 🤔", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Мужчина", callback_data: "0000000000" }],
            [{ text: "Женщина", callback_data: "1111111111" }],
          ],
        },
      });
    }
    if (data === "0000000000" || data === "1111111111") {
      const user = users[chatId];
      if (user) {
        user.money += 1;
        return bot.sendMessage(chatId, `Твой баланс ${user.money}р.`, {
          reply_markup: JSON.stringify({
            inline_keyboard: [
              [{ text: "Продолжить", callback_data: "makemoney" }],
              [{ text: "Вывести деньги", callback_data: "sendmoney" }],
            ],
          }),
        });
      }
    }
    if (data === "sendmoney") {
      return bot.sendMessage(chatId, "Ай иди ты нахуй", {
        reply_markup: {
          inline_keyboard: [[{ text: "Ок", callback_data: "makemoney" }]],
        },
      });
    }
  });
};

start();
