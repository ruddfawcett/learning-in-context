#!/usr/bin/python
# -*- coding: utf-8 -*-

import json

words = [
    '校外考察',
    '外滩',
    '码头',
    '黄浦江',
    '造',
    '世纪',
    '金融',
    '商业',
    '年代',
    '座',
    '式',
    '希腊',
    '保护',
    '黄浦公园',
    '纪念馆'
]

definitions = [
    'External study',
    'The Bund',
    'pier',
    'Huangpu River',
    'Make',
    'century',
    'financial',
    'business',
    'The age',
    'seat',
    'formula',
    'Greece',
    'protection',
    'Huangpu Park',
    'memorial'
]

pinyin = [
    'Xiàowài kǎochá',
    'wàitān',
    'mǎtóu',
    'huángpǔ jiāng',
    'zào',
    'shìjì',
    'jīnróng',
    'shāngyè',
    'niándài',
    'zuò',
    'shì',
    'xīlà',
    'bǎohù',
    'huángpǔ gōngyuán',
    'jìniànguǎn'
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
        # 'part_of_speech': pos[idx]
    }

print(json.dumps(dct, ensure_ascii=False))
