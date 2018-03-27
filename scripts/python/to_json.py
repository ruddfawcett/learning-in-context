#!/usr/bin/python
# -*- coding: utf-8 -*-

import json

words = [
    '华人',
    '劳工',
    '淘金热',
    '加州',
    '铁路',
    '禁止',
    '针对',
    '特定族群',
    '移民法',
    '通过',
    '大规模',
    '反华',
    '情绪',
    '旧金山',
    '排斥',
    '金矿'
]

definitions = [
    'Chinese people',
    'labor',
    'gold rush',
    'California',
    'railroad',
    'prohibit',
    'against',
    'specific ethnic groups',
    'immigration law',
    'through',
    'large scale',
    'anti-China',
    'mood',
    'San Francisco',
    'exclude',
    'gold mine'
]

pinyin = [
    'Huárén',
    'láogōng',
    'táojīn rè',
    'jiāzhōu',
    'tiělù',
    'jìnzhǐ',
    'zhēnduì',
    'tèdìng zúqún',
    'yímín fǎ',
    'tōngguò',
    'dà guīmó',
    'fǎnhuá',
    'qíngxù',
    'jiùjīnshān',
    'páichì',
    'jīn kuàng'
]

pos = [
    'n',
    'n',
    'n',
    'n',
    'n',
    'v',
    'v',
    'n',
    'n',
    'pron',
    'adj',
    'adj',
    'n',
    'n',
    'v',
    'n'
]

dct = {}

for idx, val in enumerate(words):
    dct[definitions[idx]] = {
        'zh': val,
        'pinyin': pinyin[idx],
        'en': definitions[idx],
        'part_of_speech': pos[idx]
    }

print(json.dumps(dct, ensure_ascii=False))
