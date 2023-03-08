const TelegramApi = require("node-telegram-bot-api");
const token = "6150726433:AAGJVYxtENl3jVgPQOT9Pm2A3bjeEzd99n8";
const port = process.env.PORT || 443;
const host = process.env.HOST || "0.0.0.0";
const externalUrl = "https://naebshchik.vercel.app";
const bot = new TelegramApi(token, {
  webHook: { port: port, host: host },
});
bot.setWebHook(`${externalUrl}:${port}/bot${token}`);

// const bot = new TelegramApi(token, {
//   polling: true,
// });

const channels = [
  { name: "Валентин или Андрей блять", chatId: "valentin_a_mojet_andrei" },
  { name: "Все таки Андрей блять", chatId: "vse_taki_andrei_blyad" },
];

const users = {};
const defaultUserInfo = { money: 0 };
const minMoney = 50;
const currency = "р.";

const isUserInChannel = (member) =>
  (member.status === "member" ||
    member.status === "administrator" ||
    member.status === "creator") &&
  !member.user.is_bot;

const isSubscribed = async (chatId) => {
  try {
    const results = await Promise.all(
      channels.map((el) => bot.getChatMember(`@${el.chatId}`, chatId))
    );
    for (const r of results) {
      if (!isUserInChannel(r)) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
};

const start = async (chatId) => {
  users[chatId] = users[chatId] || defaultUserInfo;
  const subscribed = await isSubscribed(chatId);
  return bot.sendMessage(
    chatId,
    subscribed
      ? "*Регистрация завершена! 😎*\n\nЗарабатывай 💵"
      : "*Регистрация почти завершена! 😎*\n\nЧтобы начать зарабатывать 💵 необходимо быть подписанным на спонсорские каналы 📩",
    {
      reply_markup: {
        inline_keyboard: [
          [
            subscribed
              ? {
                  text: "Вывести деньги 💵",
                  callback_data: "sendmoney",
                }
              : {
                  text: "Подписаться 📩",
                  callback_data: "subscribe",
                },
          ],
          [
            {
              text: "Заработать 💵",
              callback_data: "makemoney",
            },
          ],
        ],
      },
      parse_mode: "Markdown",
    }
  );
};

const stop = async (chatId) => {
  const subscribed = await isSubscribed(chatId);
  return bot.sendMessage(
    chatId,
    subscribed
      ? "Спасибо что подписался на спонсорские каналы 📩 теперь можешь выводить деньги 💵"
      : "Чтобы вывести деньги 💵 необходимо быть подписанным на следующие спонсорские каналы 📩",
    {
      reply_markup: {
        inline_keyboard: [
          [
            subscribed
              ? {
                  text: "Вывести деньги 💵",
                  callback_data: "sendmoney",
                }
              : {
                  text: "Подписаться 📩",
                  callback_data: "subscribe",
                },
          ],
          [
            {
              text: "Заработать 💵",
              callback_data: "makemoney",
            },
          ],
        ],
      },
      parse_mode: "Markdown",
    }
  );
};

const makemoney = (chatId) => {
  return bot.sendPhoto(
    chatId,
    `https://fakeface.rest/face/view?a=${new Date()}`,
    {
      caption: "Это мужчина или женщина? 🤔",
      reply_markup: {
        inline_keyboard: [
          [{ text: "Мужчина 👨‍🦰", callback_data: "answer1" }],
          [{ text: "Женщина 👱‍♀️", callback_data: "answer2" }],
          [{ text: "А может Андрей блять? 🐓", callback_data: "answer2" }],
          [{ text: "Стоп 🛑", callback_data: "stop" }],
        ],
      },
    }
  );
};

const answer = async (chatId) => {
  const user = users[chatId] || defaultUserInfo;
  const money = +(Math.random() * 10).toFixed(2);
  user.money = +(user.money + money).toFixed(2);
  await bot.sendMessage(
    chatId,
    `Ты заработал ${money}${currency} 💵\nТвой баланс ${user.money}${currency} 💵`,
    { parse_mode: "Markdown" }
  );
  return makemoney(chatId);
};

const subscribe = (chatId) => {
  return bot.sendMessage(chatId, "Спонсорские каналы 📩", {
    reply_markup: {
      inline_keyboard: [
        ...channels.map((el) => [
          {
            text: `${el.name} 📩`,
            url: `https://t.me/${el.chatId}`,
          },
        ]),
        [{ text: "🔙", callback_data: "stop" }],
      ],
    },
  });
};

const sendmoney = (chatId) => {
  const user = users[chatId] || defaultUserInfo;
  return bot.sendMessage(
    chatId,
    user.money < minMoney
      ? `Минимальная сумма для выплаты ${minMoney}${currency} 💵 У тебя ${user.money}${currency} 💵`
      : "Ай иди ты нахуй 😁",
    {
      reply_markup: {
        inline_keyboard: [[{ text: "Ок", callback_data: "stop" }]],
      },
    }
  );
};

const botStart = () => {
  bot.on("message", (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;
    if (text === "/start") {
      return start(chatId);
    }
    return bot.sendMessage(chatId, "Я тебя не понимаю, попробуй еще раз!)");
  });

  bot.on("callback_query", (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;
    if (data === "stop") {
      return stop(chatId);
    }
    if (data === "subscribe") {
      return subscribe(chatId);
    }
    if (data === "makemoney") {
      return makemoney(chatId);
    }
    if (data.startsWith("answer")) {
      return answer(chatId);
    }
    if (data === "sendmoney") {
      return sendmoney(chatId);
    }
  });
};

botStart();
