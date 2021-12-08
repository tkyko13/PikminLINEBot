'use strict';

require('dotenv').config();
const express = require('express');
const line = require('@line/bot-sdk');
const PORT = process.env.PORT || 3000;

const config = {
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESSTOKEN
};
const LINE_USERID = process.env.LINE_USERID;

// plant info
const pikminData = [
  {
    plantImg: 'https://app-story.net/wp-content/uploads/2021/11/akanonae-1.jpg',
    pikminImg: 'https://app-story.net/wp-content/uploads/2021/11/aka.jpg',
    type: '赤い苗'
  },
  {
    plantImg: 'https://app-story.net/wp-content/uploads/2021/11/kiiro.jpg',
    pikminImg: 'https://app-story.net/wp-content/uploads/2021/11/kiiro-1.jpg',
    type: '黄色い苗'
  },
  {
    plantImg: 'https://app-story.net/wp-content/uploads/2021/11/ao.jpg',
    pikminImg: 'https://app-story.net/wp-content/uploads/2021/11/ao-1.jpg',
    type: '青い苗'
  },
  {
    plantImg: 'https://app-story.net/wp-content/uploads/2021/11/murasaki-1.jpg',
    pikminImg: 'https://app-story.net/wp-content/uploads/2021/11/murasaki-2.jpg',
    type: '紫色の苗'
  },
  {
    plantImg: 'https://app-story.net/wp-content/uploads/2021/11/shiro.jpg',
    pikminImg: 'https://app-story.net/wp-content/uploads/2021/11/shiro-1.jpg',
    type: '白色の苗'
  },
  {
    plantImg: 'https://app-story.net/wp-content/uploads/2021/11/pinku.jpg',
    pikminImg: 'https://app-story.net/wp-content/uploads/2021/11/hane.jpg',
    type: 'ピンク色の苗'
  },
  {
    plantImg: 'https://app-story.net/wp-content/uploads/2021/11/gure.jpg',
    pikminImg: 'https://app-story.net/wp-content/uploads/2021/11/iwa.jpg',
    type: 'グレー色の苗'
  },
];

const app = express();

const client = new line.Client(config);

app.get('/', (req, res) => res.send('Hello LINE BOT!(GET)')); //ブラウザ確認用(無くても問題ない)

// 以下replay message用　userIDも調べられる
app.post('/webhook', line.middleware(config), (req, res) => {
  console.log(req.body.events);

  if (req.body.events.length == 0) {
    res.send('Hello LINE BOT!(POST)');
    console.log('疎通確認用');
    return;
  }

  Promise.all(req.body.events.map(handleEvent)).then((result) =>
    res.json(result)
  );
});
async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }
  console.log(event.source.userId);
  for (let i = 0; i < pikminData.length; i++) {
    if (pikminData[i].type == event.message.text) {
      return client.replyMessage(event.replyToken, {
        'type': 'image',
        'originalContentUrl': pikminData[i].pikminImg,
        'previewImageUrl': pikminData[i].pikminImg
      });
    }
  }

  // オウム返し
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: event.message.text, //実際に返信の言葉を入れる箇所
  });
}
app.use(express.json());
app.post('/ifttt', async (req, res) => {
  // const totalStep = parseInt(5000 + Math.random() * 10000); // test用
  const totalStep = req.query.totalStep;
  console.log('totalStep = ' + totalStep);

  let index = 0;
  if (totalStep < 10000) {
    index = parseInt(Math.random() * 3);
  }
  else {
    index = parseInt(3 + Math.random() * 4);
  }
  console.log('index = ' + index);

  client.pushMessage(LINE_USERID, {
    'type': 'template',
    'altText': 'This is a buttons template',
    'template': {
      'type': 'buttons',
      'thumbnailImageUrl': pikminData[index].plantImg,
      'imageAspectRatio': 'square',
      'imageSize': 'cover',
      'imageBackgroundColor': '#FFFFFF',
      'title': 'おつかれさまです！',
      'text': '今日は' + totalStep + '歩あるきました。',
      'actions': [
        {
          'type': 'message',
          'label': '引っこ抜く',
          'text': pikminData[index].type
        }
      ]
    }
  });

  res.send('ifttt post');
});


// app.listen(PORT);
// console.log(`Server running at ${PORT}`);
(process.env.NOW_REGION) ? module.exports = app : app.listen(PORT);
console.log(`Server running at ${PORT}`);
