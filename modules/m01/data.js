'use strict';
// Methodical sources: see README.md. Content version is fixed for saved attempts.
const M01_DATA={
  "version": 1,
  "words": {
    "L01-W01": {
      "id": "L01-W01",
      "hanzi": "你好",
      "syllables": [
        "ni",
        "hao"
      ],
      "tones": [
        3,
        3
      ],
      "ru": "привет",
      "audio": "L01-W01",
      "role": "target"
    },
    "L01-W02": {
      "id": "L01-W02",
      "hanzi": "你",
      "syllables": [
        "ni"
      ],
      "tones": [
        3
      ],
      "ru": "ты",
      "audio": "L01-W02",
      "role": "target"
    },
    "L01-W03": {
      "id": "L01-W03",
      "hanzi": "我",
      "syllables": [
        "wo"
      ],
      "tones": [
        3
      ],
      "ru": "я",
      "audio": "L01-W03",
      "role": "target"
    },
    "L01-W04": {
      "id": "L01-W04",
      "hanzi": "好",
      "syllables": [
        "hao"
      ],
      "tones": [
        3
      ],
      "ru": "хороший / хорошо",
      "audio": "L01-W04",
      "role": "target"
    },
    "L01-W05": {
      "id": "L01-W05",
      "hanzi": "谢谢",
      "syllables": [
        "xie",
        "xie"
      ],
      "tones": [
        4,
        0
      ],
      "ru": "спасибо",
      "audio": "L01-W05",
      "role": "target"
    },
    "L02-W01": {
      "id": "L02-W01",
      "hanzi": "名字",
      "syllables": [
        "ming",
        "zi"
      ],
      "tones": [
        2,
        0
      ],
      "ru": "имя",
      "audio": "L02-W01",
      "role": "target"
    },
    "L02-W02": {
      "id": "L02-W02",
      "hanzi": "叫",
      "syllables": [
        "jiao"
      ],
      "tones": [
        4
      ],
      "ru": "звать / называться",
      "audio": "L02-W02",
      "role": "target"
    },
    "L02-W03": {
      "id": "L02-W03",
      "hanzi": "什么",
      "syllables": [
        "shen",
        "me"
      ],
      "tones": [
        2,
        0
      ],
      "ru": "что / какой",
      "audio": "L02-W03",
      "role": "target"
    },
    "L02-W04": {
      "id": "L02-W04",
      "hanzi": "是",
      "syllables": [
        "shi"
      ],
      "tones": [
        4
      ],
      "ru": "быть / являться",
      "audio": "L02-W04",
      "role": "target"
    },
    "L02-W05": {
      "id": "L02-W05",
      "hanzi": "谁",
      "syllables": [
        "shei"
      ],
      "tones": [
        2
      ],
      "ru": "кто",
      "audio": "L02-W05",
      "role": "target"
    },
    "L03-W01": {
      "id": "L03-W01",
      "hanzi": "家",
      "syllables": [
        "jia"
      ],
      "tones": [
        1
      ],
      "ru": "дом / семья",
      "audio": "L03-W01",
      "role": "target"
    },
    "L03-W02": {
      "id": "L03-W02",
      "hanzi": "家人",
      "syllables": [
        "jia",
        "ren"
      ],
      "tones": [
        1,
        2
      ],
      "ru": "члены семьи",
      "audio": "L03-W02",
      "role": "target"
    },
    "L03-W03": {
      "id": "L03-W03",
      "hanzi": "妈妈",
      "syllables": [
        "ma",
        "ma"
      ],
      "tones": [
        1,
        0
      ],
      "ru": "мама",
      "audio": "L03-W03",
      "role": "target"
    },
    "L03-W04": {
      "id": "L03-W04",
      "hanzi": "爸爸",
      "syllables": [
        "ba",
        "ba"
      ],
      "tones": [
        4,
        0
      ],
      "ru": "папа",
      "audio": "L03-W04",
      "role": "target"
    },
    "L03-W05": {
      "id": "L03-W05",
      "hanzi": "朋友",
      "syllables": [
        "peng",
        "you"
      ],
      "tones": [
        2,
        0
      ],
      "ru": "друг",
      "audio": "L03-W05",
      "role": "target"
    },
    "L04-W01": {
      "id": "L04-W01",
      "hanzi": "认识",
      "syllables": [
        "ren",
        "shi"
      ],
      "tones": [
        4,
        0
      ],
      "ru": "знать человека",
      "audio": "L04-W01",
      "role": "target"
    },
    "L04-W02": {
      "id": "L04-W02",
      "hanzi": "说",
      "syllables": [
        "shuo"
      ],
      "tones": [
        1
      ],
      "ru": "говорить",
      "audio": "L04-W02",
      "role": "target"
    },
    "L04-W03": {
      "id": "L04-W03",
      "hanzi": "汉语",
      "syllables": [
        "han",
        "yu"
      ],
      "tones": [
        4,
        3
      ],
      "ru": "китайский язык",
      "audio": "L04-W03",
      "role": "target"
    },
    "L04-W04": {
      "id": "L04-W04",
      "hanzi": "再见",
      "syllables": [
        "zai",
        "jian"
      ],
      "tones": [
        4,
        4
      ],
      "ru": "до свидания",
      "audio": "L04-W04",
      "role": "target"
    },
    "L02-X01": {
      "id": "L02-X01",
      "hanzi": "呢",
      "syllables": [
        "ne"
      ],
      "tones": [
        0
      ],
      "ru": "А …? (частица)",
      "audio": "L02-X01",
      "role": "support"
    },
    "L03-X01": {
      "id": "L03-X01",
      "hanzi": "这",
      "syllables": [
        "zhe"
      ],
      "tones": [
        4
      ],
      "ru": "это",
      "audio": "L03-X01",
      "role": "support"
    },
    "L03-X02": {
      "id": "L03-X02",
      "hanzi": "不",
      "syllables": [
        "bu"
      ],
      "tones": [
        4
      ],
      "ru": "не",
      "audio": "L03-X02",
      "role": "support"
    },
    "L04-X01": {
      "id": "L04-X01",
      "hanzi": "他",
      "syllables": [
        "ta"
      ],
      "tones": [
        1
      ],
      "ru": "он",
      "audio": "L04-X01",
      "role": "support"
    },
    "L04-X02": {
      "id": "L04-X02",
      "hanzi": "吗",
      "syllables": [
        "ma"
      ],
      "tones": [
        0
      ],
      "ru": "вопросительная частица",
      "audio": "L04-X02",
      "role": "support"
    },
    "support-hen": {
      "id": "support-hen",
      "hanzi": "很",
      "syllables": [
        "hen"
      ],
      "tones": [
        3
      ],
      "ru": "очень",
      "audio": null,
      "role": "support"
    },
    "support-xiao": {
      "id": "support-xiao",
      "hanzi": "小",
      "syllables": [
        "xiao"
      ],
      "tones": [
        3
      ],
      "ru": "маленький; часть имени",
      "audio": null,
      "role": "support"
    }
  },
  "lessons": {
    "L01": {
      "id": "L01",
      "title": "Привет!",
      "type": "study",
      "steps": [
        {
          "id": "L01-FIRST",
          "kind": "listen",
          "audio": "L01-A",
          "prompt": "Послушай разговор без текста.",
          "skill": null
        },
        {
          "id": "L01-DIAG",
          "kind": "choice",
          "prompt": "Как тебе показалось, о чём разговор?",
          "options": [
            "Об общении",
            "О покупках",
            "Пока не понял"
          ],
          "answer": 0,
          "skill": "listening",
          "diagnostic": true
        },
        {
          "id": "L01-C01",
          "kind": "choice",
          "prompt": "Сколько человек беседуют?",
          "options": [
            "1",
            "2",
            "3"
          ],
          "answer": 1,
          "skill": "listening",
          "diagnostic": true
        },
        {
          "id": "L01-C02",
          "kind": "choice",
          "prompt": "О чём разговор?",
          "options": [
            "Покупки",
            "Приветствие и самочувствие",
            "Школа"
          ],
          "answer": 1,
          "skill": "listening",
          "diagnostic": true
        },
        {
          "id": "L01-C03",
          "kind": "choice",
          "prompt": "Как себя чувствует второй собеседник?",
          "options": [
            "Хорошо",
            "Плохо",
            "Неизвестно"
          ],
          "answer": 0,
          "skill": "listening",
          "diagnostic": true
        },
        {
          "id": "L01-CARD-L01-W01",
          "kind": "word",
          "word": "L01-W01",
          "diagnostic": true
        },
        {
          "id": "L01-CARD-L01-W02",
          "kind": "word",
          "word": "L01-W02",
          "diagnostic": true
        },
        {
          "id": "L01-CARD-L01-W03",
          "kind": "word",
          "word": "L01-W03",
          "diagnostic": true
        },
        {
          "id": "L01-CARD-L01-W04",
          "kind": "word",
          "word": "L01-W04",
          "diagnostic": true
        },
        {
          "id": "L01-CARD-L01-W05",
          "kind": "word",
          "word": "L01-W05",
          "diagnostic": true
        },
        {
          "id": "L01-CARD-support-hen",
          "kind": "word",
          "word": "support-hen",
          "diagnostic": true
        },
        {
          "id": "L01-CARD-L04-X02",
          "kind": "word",
          "word": "L04-X02",
          "diagnostic": true
        },
        {
          "id": "L01-V01",
          "kind": "choice",
          "prompt": "我 — что это значит?",
          "options": [
            "я",
            "привет",
            "ты"
          ],
          "answer": 0,
          "skill": "recognition"
        },
        {
          "id": "L01-V02",
          "kind": "choice",
          "prompt": "谢谢 — что это значит?",
          "options": [
            "спасибо",
            "привет",
            "ты"
          ],
          "answer": 0,
          "skill": "recognition"
        },
        {
          "id": "L01-V03",
          "kind": "choice",
          "prompt": "Послушай и найди запись.",
          "options": [
            "你好",
            "谢谢",
            "我"
          ],
          "answer": 0,
          "skill": "listening",
          "audio": "L01-W01"
        },
        {
          "id": "L01-P01",
          "kind": "pinyin",
          "word": "L01-W03",
          "skill": "pinyin",
          "audio": "L01-W03"
        },
        {
          "id": "L01-P02",
          "kind": "pinyin",
          "word": "L01-W04",
          "skill": "pinyin",
          "audio": "L01-W04"
        },
        {
          "id": "L01-P03",
          "kind": "pinyin",
          "word": "L01-W02",
          "skill": "pinyin",
          "audio": "L01-W02"
        },
        {
          "id": "L01-MODEL01",
          "kind": "model",
          "character": "我",
          "meaning": "я"
        },
        {
          "id": "L01-H01",
          "kind": "hanzi",
          "character": "我",
          "meaning": "я",
          "skill": "writing",
          "afterModel": true
        },
        {
          "id": "L01-MODEL02",
          "kind": "model",
          "character": "你",
          "meaning": "ты"
        },
        {
          "id": "L01-H02",
          "kind": "hanzi",
          "character": "你",
          "meaning": "ты",
          "skill": "writing",
          "afterModel": true
        },
        {
          "id": "L01-SECOND",
          "kind": "listen",
          "audio": "L01-A",
          "prompt": "Послушай диалог ещё раз без текста."
        },
        {
          "id": "L01-R01",
          "kind": "choice",
          "prompt": "Каким выражением оба поздоровались?",
          "options": [
            "你好",
            "谢谢",
            "我"
          ],
          "answer": 0,
          "skill": "listening"
        },
        {
          "id": "L01-R02",
          "kind": "choice",
          "prompt": "Что сказал второй собеседник в конце?",
          "options": [
            "你好吗",
            "我很好，谢谢",
            "你好"
          ],
          "answer": 1,
          "skill": "listening"
        },
        {
          "id": "L01-TRANSCRIPT",
          "kind": "transcript",
          "audio": "L01-A"
        },
        {
          "id": "L01-F01",
          "kind": "choice",
          "prompt": "Послушай и выбери запись.",
          "options": [
            "你好",
            "谢谢",
            "我"
          ],
          "answer": 0,
          "skill": "listening",
          "audio": "L01-W01",
          "mode": "test"
        },
        {
          "id": "L01-F02",
          "kind": "choice",
          "prompt": "我 — что это значит?",
          "options": [
            "я",
            "ты",
            "спасибо"
          ],
          "answer": 0,
          "skill": "recognition",
          "mode": "test"
        },
        {
          "id": "L01-F03",
          "kind": "pinyin",
          "word": "L01-W04",
          "skill": "pinyin",
          "audio": "L01-W04",
          "mode": "test"
        },
        {
          "id": "L01-F04",
          "kind": "hanzi",
          "character": "你",
          "meaning": "ты",
          "skill": "writing",
          "mode": "test"
        },
        {
          "id": "L01-F05",
          "kind": "choice",
          "prompt": "Послушай и выбери значение.",
          "options": [
            "спасибо",
            "привет",
            "хорошо"
          ],
          "answer": 0,
          "skill": "listening",
          "audio": "L01-W05",
          "mode": "test"
        }
      ]
    },
    "L02": {
      "id": "L02",
      "title": "Как тебя зовут?",
      "type": "study",
      "steps": [
        {
          "id": "L02-FIRST",
          "kind": "listen",
          "audio": "L02-A",
          "prompt": "Послушай разговор без текста.",
          "skill": null
        },
        {
          "id": "L02-DIAG",
          "kind": "choice",
          "prompt": "Как тебе показалось, о чём разговор?",
          "options": [
            "Об общении",
            "О покупках",
            "Пока не понял"
          ],
          "answer": 0,
          "skill": "listening",
          "diagnostic": true
        },
        {
          "id": "L02-C01",
          "kind": "choice",
          "prompt": "О чём спрашивают?",
          "options": [
            "Об имени",
            "О самочувствии",
            "О семье"
          ],
          "answer": 0,
          "skill": "listening",
          "diagnostic": true
        },
        {
          "id": "L02-C02",
          "kind": "choice",
          "prompt": "Как зовут Б?",
          "options": [
            "Сяохун",
            "Сяомин",
            "Неизвестно"
          ],
          "answer": 1,
          "skill": "listening",
          "diagnostic": true
        },
        {
          "id": "L02-C03",
          "kind": "choice",
          "prompt": "Как зовут А?",
          "options": [
            "Сяохун",
            "Сяомин",
            "Неизвестно"
          ],
          "answer": 0,
          "skill": "listening",
          "diagnostic": true
        },
        {
          "id": "L02-CARD-L02-W01",
          "kind": "word",
          "word": "L02-W01",
          "diagnostic": true
        },
        {
          "id": "L02-CARD-L02-W02",
          "kind": "word",
          "word": "L02-W02",
          "diagnostic": true
        },
        {
          "id": "L02-CARD-L02-W03",
          "kind": "word",
          "word": "L02-W03",
          "diagnostic": true
        },
        {
          "id": "L02-CARD-L02-W04",
          "kind": "word",
          "word": "L02-W04",
          "diagnostic": true
        },
        {
          "id": "L02-CARD-L02-W05",
          "kind": "word",
          "word": "L02-W05",
          "diagnostic": true
        },
        {
          "id": "L02-CARD-L02-X01",
          "kind": "word",
          "word": "L02-X01",
          "diagnostic": true
        },
        {
          "id": "L02-CARD-support-xiao",
          "kind": "word",
          "word": "support-xiao",
          "diagnostic": true
        },
        {
          "id": "L02-V01",
          "kind": "choice",
          "prompt": "名字 — что это значит?",
          "options": [
            "имя",
            "звать / называться",
            "что / какой"
          ],
          "answer": 0,
          "skill": "recognition"
        },
        {
          "id": "L02-V02",
          "kind": "choice",
          "prompt": "叫 — что это значит?",
          "options": [
            "звать / называться",
            "имя",
            "что / какой"
          ],
          "answer": 0,
          "skill": "recognition"
        },
        {
          "id": "L02-V03",
          "kind": "choice",
          "prompt": "什么 — что это значит?",
          "options": [
            "что / какой",
            "имя",
            "звать / называться"
          ],
          "answer": 0,
          "skill": "recognition"
        },
        {
          "id": "L02-V04",
          "kind": "choice",
          "prompt": "是 — что это значит?",
          "options": [
            "быть / являться",
            "имя",
            "звать / называться"
          ],
          "answer": 0,
          "skill": "recognition"
        },
        {
          "id": "L02-V05",
          "kind": "choice",
          "prompt": "谁 — что это значит?",
          "options": [
            "кто",
            "имя",
            "звать / называться"
          ],
          "answer": 0,
          "skill": "recognition"
        },
        {
          "id": "L02-AUDIO-L02-W04",
          "kind": "choice",
          "prompt": "Послушай слово и выбери значение.",
          "options": [
            "быть / являться",
            "спасибо",
            "говорить"
          ],
          "answer": 0,
          "skill": "listening",
          "audio": "L02-W04"
        },
        {
          "id": "L02-AUDIO-L02-W05",
          "kind": "choice",
          "prompt": "Послушай слово и выбери значение.",
          "options": [
            "кто",
            "спасибо",
            "говорить"
          ],
          "answer": 0,
          "skill": "listening",
          "audio": "L02-W05"
        },
        {
          "id": "L02-P01",
          "kind": "pinyin",
          "word": "L02-W02",
          "skill": "pinyin",
          "audio": null
        },
        {
          "id": "L02-P02",
          "kind": "pinyin",
          "word": "L02-W01",
          "skill": "pinyin",
          "audio": null
        },
        {
          "id": "L02-P03",
          "kind": "pinyin",
          "word": "L02-W03",
          "skill": "pinyin",
          "audio": null
        },
        {
          "id": "L02-MODEL01",
          "kind": "model",
          "character": "叫",
          "meaning": "звать"
        },
        {
          "id": "L02-H01",
          "kind": "hanzi",
          "character": "叫",
          "meaning": "звать",
          "skill": "writing",
          "afterModel": true
        },
        {
          "id": "L02-SECOND",
          "kind": "listen",
          "audio": "L02-A",
          "prompt": "Послушай диалог ещё раз без текста."
        },
        {
          "id": "L02-R01",
          "kind": "choice",
          "prompt": "Кто назвал имя первым?",
          "options": [
            "А",
            "Б"
          ],
          "answer": 1,
          "skill": "listening"
        },
        {
          "id": "L02-R02",
          "kind": "choice",
          "prompt": "Что значит 我叫小红?",
          "options": [
            "Меня зовут Сяохун",
            "Меня зовут Сяомин",
            "Как тебя зовут?"
          ],
          "answer": 0,
          "skill": "listening"
        },
        {
          "id": "L02-TRANSCRIPT",
          "kind": "transcript",
          "audio": "L02-A"
        }
      ]
    },
    "L03": {
      "id": "L03",
      "title": "Я и моя семья",
      "type": "study",
      "steps": [
        {
          "id": "L03-FIRST",
          "kind": "listen",
          "audio": "L03-A",
          "prompt": "Послушай разговор без текста. Собеседник показывает людей рядом с собой.",
          "skill": null
        },
        {
          "id": "L03-DIAG",
          "kind": "choice",
          "prompt": "Как тебе показалось, о чём разговор?",
          "options": [
            "Об общении",
            "О покупках",
            "Пока не понял"
          ],
          "answer": 0,
          "skill": "listening",
          "diagnostic": true
        },
        {
          "id": "L03-C01",
          "kind": "choice",
          "prompt": "Кто представлен первым?",
          "options": [
            "Мама",
            "Папа",
            "Друг"
          ],
          "answer": 0,
          "skill": "listening",
          "diagnostic": true
        },
        {
          "id": "L03-C02",
          "kind": "choice",
          "prompt": "Кого ошибочно предположили?",
          "options": [
            "Маму",
            "Папу",
            "Друга"
          ],
          "answer": 1,
          "skill": "listening",
          "diagnostic": true
        },
        {
          "id": "L03-C03",
          "kind": "choice",
          "prompt": "Кто это оказался?",
          "options": [
            "Мама",
            "Папа",
            "Друг"
          ],
          "answer": 2,
          "skill": "listening",
          "diagnostic": true
        },
        {
          "id": "L03-CARD-L03-W01",
          "kind": "word",
          "word": "L03-W01",
          "diagnostic": true
        },
        {
          "id": "L03-CARD-L03-W02",
          "kind": "word",
          "word": "L03-W02",
          "diagnostic": true
        },
        {
          "id": "L03-CARD-L03-W03",
          "kind": "word",
          "word": "L03-W03",
          "diagnostic": true
        },
        {
          "id": "L03-CARD-L03-W04",
          "kind": "word",
          "word": "L03-W04",
          "diagnostic": true
        },
        {
          "id": "L03-CARD-L03-W05",
          "kind": "word",
          "word": "L03-W05",
          "diagnostic": true
        },
        {
          "id": "L03-CARD-L03-X01",
          "kind": "word",
          "word": "L03-X01",
          "diagnostic": true
        },
        {
          "id": "L03-CARD-L03-X02",
          "kind": "word",
          "word": "L03-X02",
          "diagnostic": true
        },
        {
          "id": "L03-CARD-L02-W04",
          "kind": "word",
          "word": "L02-W04",
          "diagnostic": true
        },
        {
          "id": "L03-CARD-L04-X02",
          "kind": "word",
          "word": "L04-X02",
          "diagnostic": true
        },
        {
          "id": "L03-V01",
          "kind": "choice",
          "prompt": "家 — что это значит?",
          "options": [
            "дом / семья",
            "члены семьи",
            "мама"
          ],
          "answer": 0,
          "skill": "recognition"
        },
        {
          "id": "L03-V02",
          "kind": "choice",
          "prompt": "家人 — что это значит?",
          "options": [
            "члены семьи",
            "дом / семья",
            "мама"
          ],
          "answer": 0,
          "skill": "recognition"
        },
        {
          "id": "L03-V03",
          "kind": "choice",
          "prompt": "妈妈 — что это значит?",
          "options": [
            "мама",
            "дом / семья",
            "члены семьи"
          ],
          "answer": 0,
          "skill": "recognition"
        },
        {
          "id": "L03-V04",
          "kind": "choice",
          "prompt": "爸爸 — что это значит?",
          "options": [
            "папа",
            "дом / семья",
            "члены семьи"
          ],
          "answer": 0,
          "skill": "recognition"
        },
        {
          "id": "L03-V05",
          "kind": "choice",
          "prompt": "朋友 — что это значит?",
          "options": [
            "друг",
            "дом / семья",
            "члены семьи"
          ],
          "answer": 0,
          "skill": "recognition"
        },
        {
          "id": "L03-AUDIO-L03-W01",
          "kind": "choice",
          "prompt": "Послушай слово и выбери значение.",
          "options": [
            "дом / семья",
            "спасибо",
            "говорить"
          ],
          "answer": 0,
          "skill": "listening",
          "audio": "L03-W01"
        },
        {
          "id": "L03-AUDIO-L03-W02",
          "kind": "choice",
          "prompt": "Послушай слово и выбери значение.",
          "options": [
            "члены семьи",
            "спасибо",
            "говорить"
          ],
          "answer": 0,
          "skill": "listening",
          "audio": "L03-W02"
        },
        {
          "id": "L03-P01",
          "kind": "pinyin",
          "word": "L03-W03",
          "skill": "pinyin",
          "audio": null
        },
        {
          "id": "L03-P02",
          "kind": "pinyin",
          "word": "L03-W04",
          "skill": "pinyin",
          "audio": null
        },
        {
          "id": "L03-P03",
          "kind": "pinyin",
          "word": "L03-W05",
          "skill": "pinyin",
          "audio": null
        },
        {
          "id": "L03-MODEL01",
          "kind": "model",
          "character": "妈",
          "meaning": "мама"
        },
        {
          "id": "L03-H01",
          "kind": "hanzi",
          "character": "妈",
          "meaning": "мама",
          "skill": "writing",
          "afterModel": true
        },
        {
          "id": "L03-SECOND",
          "kind": "listen",
          "audio": "L03-A",
          "prompt": "Послушай диалог ещё раз без текста."
        },
        {
          "id": "L03-R01",
          "kind": "choice",
          "prompt": "Чья мама представлена?",
          "options": [
            "Говорящего А",
            "Говорящего Б"
          ],
          "answer": 0,
          "skill": "listening"
        },
        {
          "id": "L03-R02",
          "kind": "choice",
          "prompt": "Что значит 这是我朋友?",
          "options": [
            "Это моя мама",
            "Это мой друг",
            "Это твой папа"
          ],
          "answer": 1,
          "skill": "listening"
        },
        {
          "id": "L03-TRANSCRIPT",
          "kind": "transcript",
          "audio": "L03-A"
        }
      ]
    },
    "L04": {
      "id": "L04",
      "title": "Давай поговорим",
      "type": "study",
      "steps": [
        {
          "id": "L04-FIRST",
          "kind": "listen",
          "audio": "L04-A",
          "prompt": "Послушай разговор без текста.",
          "skill": null
        },
        {
          "id": "L04-DIAG",
          "kind": "choice",
          "prompt": "Как тебе показалось, о чём разговор?",
          "options": [
            "Об общении",
            "О покупках",
            "Пока не понял"
          ],
          "answer": 0,
          "skill": "listening",
          "diagnostic": true
        },
        {
          "id": "L04-C01",
          "kind": "choice",
          "prompt": "Говорит ли Б по-китайски?",
          "options": [
            "Да",
            "Нет",
            "Неизвестно"
          ],
          "answer": 0,
          "skill": "listening",
          "diagnostic": true
        },
        {
          "id": "L04-C02",
          "kind": "choice",
          "prompt": "Знаком ли Б с Сяомином?",
          "options": [
            "Нет",
            "Да",
            "Неизвестно"
          ],
          "answer": 1,
          "skill": "listening",
          "diagnostic": true
        },
        {
          "id": "L04-C03",
          "kind": "choice",
          "prompt": "Как завершается разговор?",
          "options": [
            "Прощанием",
            "Вопросом об имени",
            "Благодарностью"
          ],
          "answer": 0,
          "skill": "listening",
          "diagnostic": true
        },
        {
          "id": "L04-CARD-L04-W01",
          "kind": "word",
          "word": "L04-W01",
          "diagnostic": true
        },
        {
          "id": "L04-CARD-L04-W02",
          "kind": "word",
          "word": "L04-W02",
          "diagnostic": true
        },
        {
          "id": "L04-CARD-L04-W03",
          "kind": "word",
          "word": "L04-W03",
          "diagnostic": true
        },
        {
          "id": "L04-CARD-L04-W04",
          "kind": "word",
          "word": "L04-W04",
          "diagnostic": true
        },
        {
          "id": "L04-CARD-L04-X01",
          "kind": "word",
          "word": "L04-X01",
          "diagnostic": true
        },
        {
          "id": "L04-CARD-L04-X02",
          "kind": "word",
          "word": "L04-X02",
          "diagnostic": true
        },
        {
          "id": "L04-CARD-support-xiao",
          "kind": "word",
          "word": "support-xiao",
          "diagnostic": true
        },
        {
          "id": "L04-V01",
          "kind": "choice",
          "prompt": "认识 — что это значит?",
          "options": [
            "знать человека",
            "говорить",
            "китайский язык"
          ],
          "answer": 0,
          "skill": "recognition"
        },
        {
          "id": "L04-V02",
          "kind": "choice",
          "prompt": "说 — что это значит?",
          "options": [
            "говорить",
            "знать человека",
            "китайский язык"
          ],
          "answer": 0,
          "skill": "recognition"
        },
        {
          "id": "L04-V03",
          "kind": "choice",
          "prompt": "汉语 — что это значит?",
          "options": [
            "китайский язык",
            "знать человека",
            "говорить"
          ],
          "answer": 0,
          "skill": "recognition"
        },
        {
          "id": "L04-V04",
          "kind": "choice",
          "prompt": "再见 — что это значит?",
          "options": [
            "до свидания",
            "знать человека",
            "говорить"
          ],
          "answer": 0,
          "skill": "recognition"
        },
        {
          "id": "L04-V05",
          "kind": "choice",
          "prompt": "吗 — что это значит?",
          "options": [
            "вопросительная частица",
            "знать человека",
            "говорить"
          ],
          "answer": 0,
          "skill": "recognition"
        },
        {
          "id": "L04-P01",
          "kind": "pinyin",
          "word": "L04-W01",
          "skill": "pinyin",
          "audio": null
        },
        {
          "id": "L04-P02",
          "kind": "pinyin",
          "word": "L04-W02",
          "skill": "pinyin",
          "audio": null
        },
        {
          "id": "L04-P03",
          "kind": "pinyin",
          "word": "L04-W04",
          "skill": "pinyin",
          "audio": null
        },
        {
          "id": "L04-MODEL01",
          "kind": "model",
          "character": "说",
          "meaning": "говорить"
        },
        {
          "id": "L04-H01",
          "kind": "hanzi",
          "character": "说",
          "meaning": "говорить",
          "skill": "writing",
          "afterModel": true
        },
        {
          "id": "L04-S01",
          "kind": "choice",
          "prompt": "Ты говоришь по-китайски?",
          "options": [
            "你说汉语吗？",
            "我说汉语。",
            "我认识他。"
          ],
          "answer": 0,
          "skill": "sentence_comprehension"
        },
        {
          "id": "L04-S02",
          "kind": "choice",
          "prompt": "Я говорю по-китайски.",
          "options": [
            "我认识他。",
            "我说汉语。",
            "你说汉语吗？"
          ],
          "answer": 1,
          "skill": "sentence_comprehension"
        },
        {
          "id": "L04-SECOND",
          "kind": "listen",
          "audio": "L04-A",
          "prompt": "Послушай диалог ещё раз без текста."
        },
        {
          "id": "L04-R01",
          "kind": "choice",
          "prompt": "Кто знаком с Сяомином?",
          "options": [
            "Б",
            "А — это точно известно",
            "Никто"
          ],
          "answer": 0,
          "skill": "listening"
        },
        {
          "id": "L04-R02",
          "kind": "choice",
          "prompt": "Как звучит прощание?",
          "options": [
            "你好",
            "谢谢",
            "再见"
          ],
          "answer": 2,
          "skill": "listening"
        },
        {
          "id": "L04-TRANSCRIPT",
          "kind": "transcript",
          "audio": "L04-A"
        }
      ]
    },
    "L05": {
      "id": "L05",
      "title": "Проверка 1",
      "type": "test",
      "steps": [
        {
          "id": "L05-FIRST",
          "kind": "listen",
          "audio": "L05-A",
          "prompt": "Послушай разговор без текста.",
          "skill": null
        },
        {
          "id": "L05-C01",
          "kind": "choice",
          "prompt": "Как зовут Б?",
          "options": [
            "Сяомин",
            "Сяохун",
            "Неизвестно"
          ],
          "answer": 1,
          "skill": "listening"
        },
        {
          "id": "L05-C02",
          "kind": "choice",
          "prompt": "Как зовут А?",
          "options": [
            "Сяомин",
            "Сяохун",
            "Неизвестно"
          ],
          "answer": 0,
          "skill": "listening"
        },
        {
          "id": "L05-C03",
          "kind": "choice",
          "prompt": "О ком спрашивает А?",
          "options": [
            "О своём друге",
            "О маме",
            "О папе"
          ],
          "answer": 0,
          "skill": "listening"
        },
        {
          "id": "L05-C04",
          "kind": "choice",
          "prompt": "Знаком ли Б с другом А?",
          "options": [
            "Нет",
            "Неизвестно",
            "Да"
          ],
          "answer": 2,
          "skill": "listening"
        },
        {
          "id": "L05-V01",
          "kind": "choice",
          "prompt": "你好 — что это значит?",
          "options": [
            "привет",
            "ты",
            "папа"
          ],
          "answer": 0,
          "skill": "recognition"
        },
        {
          "id": "L05-V02",
          "kind": "choice",
          "prompt": "朋友 — что это значит?",
          "options": [
            "друг",
            "ты",
            "папа"
          ],
          "answer": 0,
          "skill": "recognition"
        },
        {
          "id": "L05-V03",
          "kind": "choice",
          "prompt": "认识 — что это значит?",
          "options": [
            "знать человека",
            "ты",
            "папа"
          ],
          "answer": 0,
          "skill": "recognition"
        },
        {
          "id": "L05-V04",
          "kind": "choice",
          "prompt": "名字 — что это значит?",
          "options": [
            "имя",
            "ты",
            "папа"
          ],
          "answer": 0,
          "skill": "recognition"
        },
        {
          "id": "L05-V05",
          "kind": "choice",
          "prompt": "谢谢 — что это значит?",
          "options": [
            "спасибо",
            "ты",
            "папа"
          ],
          "answer": 0,
          "skill": "recognition"
        },
        {
          "id": "L05-P01",
          "kind": "pinyin",
          "word": "L01-W03",
          "skill": "pinyin"
        },
        {
          "id": "L05-P02",
          "kind": "pinyin",
          "word": "L02-W02",
          "skill": "pinyin"
        },
        {
          "id": "L05-P03",
          "kind": "pinyin",
          "word": "L01-W04",
          "skill": "pinyin"
        },
        {
          "id": "L05-P04",
          "kind": "pinyin",
          "word": "L03-W05",
          "skill": "pinyin"
        },
        {
          "id": "L05-H01",
          "kind": "hanzi",
          "character": "我",
          "meaning": "я",
          "skill": "writing"
        },
        {
          "id": "L05-H02",
          "kind": "hanzi",
          "character": "你",
          "meaning": "ты",
          "skill": "writing"
        },
        {
          "id": "L05-S01",
          "kind": "choice",
          "prompt": "Меня зовут Сяомин.",
          "options": [
            "我叫小明。",
            "你叫什么名字？",
            "我叫小红。"
          ],
          "answer": 0,
          "skill": "sentence_comprehension"
        },
        {
          "id": "L05-S02",
          "kind": "choice",
          "prompt": "Ты говоришь по-китайски?",
          "options": [
            "我说汉语。",
            "你说汉语吗？",
            "我认识他。"
          ],
          "answer": 1,
          "skill": "sentence_comprehension"
        }
      ]
    }
  },
  "assets": {
    "L01-A": {
      "id": "L01-A",
      "text": "你好！\n你好！\n你好吗？\n我很好，谢谢！",
      "pinyin": "Nǐ hǎo! / Nǐ hǎo! / Nǐ hǎo ma? / Wǒ hěn hǎo, xièxie!",
      "duration_seconds": 5.267417,
      "technical_checked": true,
      "listening_checked": false,
      "approved": false,
      "path": "modules/m01/audio/L01-A.mp3",
      "sha256": "9c75b9a232c3e15ef6dae0d5b36fd66cc49252e58117dbc3c30fe262f2811c09"
    },
    "L01-W01": {
      "id": "L01-W01",
      "text": "你好",
      "pinyin": "nǐhǎo",
      "duration_seconds": 0.775083,
      "technical_checked": true,
      "listening_checked": false,
      "approved": false,
      "path": "modules/m01/audio/L01-W01.mp3",
      "sha256": "3cbd5327f8dbc8b8ab382fa9cc9ee6833f7325614ca4e60da8e8eb6fd96d29d2"
    },
    "L01-W02": {
      "id": "L01-W02",
      "text": "你",
      "pinyin": "nǐ",
      "duration_seconds": 0.498542,
      "technical_checked": true,
      "listening_checked": false,
      "approved": false,
      "path": "modules/m01/audio/L01-W02.mp3",
      "sha256": "39571e885b74fd1e2158bbaa09682e5786c9ca07d6f7ba3a5ad1dcc993a31b80"
    },
    "L01-W03": {
      "id": "L01-W03",
      "text": "我",
      "pinyin": "wǒ",
      "duration_seconds": 0.53325,
      "technical_checked": true,
      "listening_checked": false,
      "approved": false,
      "path": "modules/m01/audio/L01-W03.mp3",
      "sha256": "5bb10f4541b3f4b8ec0f3e0cfb34556b27c5c9b397e132f80d0dbd477d82c9d8"
    },
    "L01-W04": {
      "id": "L01-W04",
      "text": "好",
      "pinyin": "hǎo",
      "duration_seconds": 0.621292,
      "technical_checked": true,
      "listening_checked": false,
      "approved": false,
      "path": "modules/m01/audio/L01-W04.mp3",
      "sha256": "6b36f8cca8457fdff0c8792a42b78b28f34ffbf128d334f3bb44520a9be87cb4"
    },
    "L01-W05": {
      "id": "L01-W05",
      "text": "谢谢",
      "pinyin": "xièxie",
      "duration_seconds": 0.814083,
      "technical_checked": true,
      "listening_checked": false,
      "approved": false,
      "path": "modules/m01/audio/L01-W05.mp3",
      "sha256": "873c2171d16e4626f081960c13973f287905baa8e94a7e88ca76a9cf36759c77"
    },
    "L02-A": {
      "id": "L02-A",
      "text": "你好！你叫什么名字？\n我叫小明。你呢？\n我叫小红。",
      "pinyin": "Nǐ hǎo! Nǐ jiào shénme míngzi? / Wǒ jiào Xiǎomíng. Nǐ ne? / Wǒ jiào Xiǎohóng.",
      "duration_seconds": 5.610333,
      "technical_checked": true,
      "listening_checked": false,
      "approved": false,
      "path": "modules/m01/audio/L02-A.mp3",
      "sha256": "d198912085deeb75891dc7d17e7f6ebbba95d479243a814ed67a2076773b821c"
    },
    "L02-W01": {
      "id": "L02-W01",
      "text": "名字",
      "pinyin": "míngzi",
      "duration_seconds": 0.806708,
      "technical_checked": true,
      "listening_checked": false,
      "approved": false,
      "path": "modules/m01/audio/L02-W01.mp3",
      "sha256": "507d2bc6b89a0d15b952e5d2880ca596de4442b7f5ee87c1214a42eba79d1b02"
    },
    "L02-W02": {
      "id": "L02-W02",
      "text": "叫",
      "pinyin": "jiào",
      "duration_seconds": 0.587875,
      "technical_checked": true,
      "listening_checked": false,
      "approved": false,
      "path": "modules/m01/audio/L02-W02.mp3",
      "sha256": "56856f3184ade0639d57b647af011a425b90ee0204d55dee0550287543bc1387"
    },
    "L02-W03": {
      "id": "L02-W03",
      "text": "什么",
      "pinyin": "shénme",
      "duration_seconds": 0.74325,
      "technical_checked": true,
      "listening_checked": false,
      "approved": false,
      "path": "modules/m01/audio/L02-W03.mp3",
      "sha256": "64e6b0bcb089ea877583ea27caf8122c747e6655d925a863427b32608bbb4494"
    },
    "L02-W04": {
      "id": "L02-W04",
      "text": "是",
      "pinyin": "shì",
      "duration_seconds": 0.606625,
      "technical_checked": true,
      "listening_checked": false,
      "approved": false,
      "path": "modules/m01/audio/L02-W04.mp3",
      "sha256": "63f25435ad8a0f298d7626f470ea947496bc7da6ba840cc9c047ed2f879370bf"
    },
    "L02-W05": {
      "id": "L02-W05",
      "text": "谁",
      "pinyin": "shéi / shuí",
      "duration_seconds": 0.611208,
      "technical_checked": true,
      "listening_checked": false,
      "approved": false,
      "path": "modules/m01/audio/L02-W05.mp3",
      "sha256": "d8535749e020b74afb6a63b9c9d8767825b9403ea256e919ee69522a70025188"
    },
    "L02-X01": {
      "id": "L02-X01",
      "text": "呢",
      "pinyin": "ne",
      "duration_seconds": 0.553292,
      "technical_checked": true,
      "listening_checked": false,
      "approved": false,
      "path": "modules/m01/audio/L02-X01.mp3",
      "sha256": "29ab7ff6e9b6a4154c30510de045934bbd26412ded30eaf56f41dc8caed3b488"
    },
    "L03-A": {
      "id": "L03-A",
      "text": "你好！\n你好！\n这是我妈妈。\n这是你爸爸吗？\n不是，这是我朋友。",
      "pinyin": "Nǐ hǎo! / Nǐ hǎo! / Zhè shì wǒ māma. / Zhè shì nǐ bàba ma? / Bú shì, zhè shì wǒ péngyou.",
      "duration_seconds": 7.675583,
      "technical_checked": true,
      "listening_checked": false,
      "approved": false,
      "path": "modules/m01/audio/L03-A.mp3",
      "sha256": "9cfc3c1f7f52925a9e9ef8facfaa0e3945af9328ea78074743a91a974a63639b"
    },
    "L03-W01": {
      "id": "L03-W01",
      "text": "家",
      "pinyin": "jiā",
      "duration_seconds": 0.621583,
      "technical_checked": true,
      "listening_checked": false,
      "approved": false,
      "path": "modules/m01/audio/L03-W01.mp3",
      "sha256": "7818e732b2dfe118946ab36b604a38280aeb5d5a487457640e6edc5eed15d183"
    },
    "L03-W02": {
      "id": "L03-W02",
      "text": "家人",
      "pinyin": "jiārén",
      "duration_seconds": 0.78575,
      "technical_checked": true,
      "listening_checked": false,
      "approved": false,
      "path": "modules/m01/audio/L03-W02.mp3",
      "sha256": "eb2de69e27491ed0a002d004646dd2209d90741f4bd5f7d740a6b24a6262996e"
    },
    "L03-W03": {
      "id": "L03-W03",
      "text": "妈妈",
      "pinyin": "māma",
      "duration_seconds": 0.776,
      "technical_checked": true,
      "listening_checked": false,
      "approved": false,
      "path": "modules/m01/audio/L03-W03.mp3",
      "sha256": "d7fa7fa2d5b56f47deb6774f6062a328af3539de8085f419b11ec787b73417de"
    },
    "L03-W04": {
      "id": "L03-W04",
      "text": "爸爸",
      "pinyin": "bàba",
      "duration_seconds": 0.757125,
      "technical_checked": true,
      "listening_checked": false,
      "approved": false,
      "path": "modules/m01/audio/L03-W04.mp3",
      "sha256": "1704ed6a210c2b8e591c3afa9237ab3c4f4d1a9a95ad0a24a276bfc5bdde438d"
    },
    "L03-W05": {
      "id": "L03-W05",
      "text": "朋友",
      "pinyin": "péngyou",
      "duration_seconds": 0.772167,
      "technical_checked": true,
      "listening_checked": false,
      "approved": false,
      "path": "modules/m01/audio/L03-W05.mp3",
      "sha256": "488fda819f10beac3db7a69ea3bfb47935c421f3d74b2e22a30fb7566d6b94a1"
    },
    "L03-X01": {
      "id": "L03-X01",
      "text": "这",
      "pinyin": "zhè",
      "duration_seconds": 0.538083,
      "technical_checked": true,
      "listening_checked": false,
      "approved": false,
      "path": "modules/m01/audio/L03-X01.mp3",
      "sha256": "cf35aa75bc02e646e7f9236c826a6d37235e33a00faa6b3212a0ce2bef827389"
    },
    "L03-X02": {
      "id": "L03-X02",
      "text": "不",
      "pinyin": "bù",
      "duration_seconds": 0.498667,
      "technical_checked": true,
      "listening_checked": false,
      "approved": false,
      "path": "modules/m01/audio/L03-X02.mp3",
      "sha256": "310aea6e1bb7e6e7366b3dc511033fc090983616469adb520b0766177606090d"
    },
    "L04-A": {
      "id": "L04-A",
      "text": "你好！你说汉语吗？\n我说汉语。\n你认识小明吗？\n我认识他。\n再见！\n再见！",
      "pinyin": "Nǐ hǎo! Nǐ shuō Hànyǔ ma? / Wǒ shuō Hànyǔ. / Nǐ rènshi Xiǎomíng ma? / Wǒ rènshi tā. / Zàijiàn! / Zàijiàn!",
      "duration_seconds": 9.282417,
      "technical_checked": true,
      "listening_checked": false,
      "approved": false,
      "path": "modules/m01/audio/L04-A.mp3",
      "sha256": "d6b18e2ed0255bc7681810007681a72bd1c93c01d364511a6b31e607d4aa4822"
    },
    "L04-W01": {
      "id": "L04-W01",
      "text": "认识",
      "pinyin": "rènshi",
      "duration_seconds": 0.759917,
      "technical_checked": true,
      "listening_checked": false,
      "approved": false,
      "path": "modules/m01/audio/L04-W01.mp3",
      "sha256": "6551da8d88d804387e9660810244890ff2238210744b306525beac5120caaa29"
    },
    "L04-W02": {
      "id": "L04-W02",
      "text": "说",
      "pinyin": "shuō",
      "duration_seconds": 0.661125,
      "technical_checked": true,
      "listening_checked": false,
      "approved": false,
      "path": "modules/m01/audio/L04-W02.mp3",
      "sha256": "f2c04da662d5fee65371a5ab193f856ba391a88bf138034cf28b73b50270bedc"
    },
    "L04-W03": {
      "id": "L04-W03",
      "text": "汉语",
      "pinyin": "Hànyǔ",
      "duration_seconds": 0.801292,
      "technical_checked": true,
      "listening_checked": false,
      "approved": false,
      "path": "modules/m01/audio/L04-W03.mp3",
      "sha256": "a9a24beab178048c8087bb20d800d532cfe14f64bfbbf14bffb2602c87ba507f"
    },
    "L04-W04": {
      "id": "L04-W04",
      "text": "再见",
      "pinyin": "zàijiàn",
      "duration_seconds": 0.7845,
      "technical_checked": true,
      "listening_checked": false,
      "approved": false,
      "path": "modules/m01/audio/L04-W04.mp3",
      "sha256": "efe6b533656f67087aae83d3ec3826a7aa9c199933f4df43de18f06cdba678f2"
    },
    "L04-X01": {
      "id": "L04-X01",
      "text": "他",
      "pinyin": "tā",
      "duration_seconds": 0.601417,
      "technical_checked": true,
      "listening_checked": false,
      "approved": false,
      "path": "modules/m01/audio/L04-X01.mp3",
      "sha256": "107502433706b851d568cae7e5486a004fcb92c273c7bc144586302be9d0da0b"
    },
    "L04-X02": {
      "id": "L04-X02",
      "text": "吗",
      "pinyin": "ma",
      "duration_seconds": 0.556042,
      "technical_checked": true,
      "listening_checked": false,
      "approved": false,
      "path": "modules/m01/audio/L04-X02.mp3",
      "sha256": "3a4f2f5ddef842027f7249b8a9561692fb2c95efcd9acbb58cb3ad26a459cf6c"
    },
    "L05-A": {
      "id": "L05-A",
      "text": "你好！你叫什么名字？\n我叫小红。你呢？\n我叫小明。你认识我朋友吗？\n我认识他。\n再见！\n再见！",
      "pinyin": "Nǐ hǎo! Nǐ jiào shénme míngzi? / Wǒ jiào Xiǎohóng. Nǐ ne? / Wǒ jiào Xiǎomíng. Nǐ rènshi wǒ péngyou ma? / Wǒ rènshi tā. / Zàijiàn! / Zàijiàn!",
      "duration_seconds": 10.927333,
      "technical_checked": true,
      "listening_checked": false,
      "approved": false,
      "path": "modules/m01/control/L05-A.mp3",
      "sha256": "6201f8ea2079334be5edfd5f6f30180fabd7528e1cf94f079768e604dee590d5"
    }
  }
};
