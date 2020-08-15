# -*- coding: utf-8 -*- 
import sys
import os
print(sys.executable)

# # 단어구름에 필요한 라이브러리를 불러옵니다.
from wordcloud import WordCloud
# 한국어 자연어 처리 라이브러리를 불러옵니다.
from konlpy.tag import Twitter
# 명사의 출현 빈도를 세는 라이브러리를 불러옵니다.
from collections import Counter
# 그래프 생성에 필요한 라이브러리를 불러옵니다.
import matplotlib.pyplot as plt
# Flask 웹 서버 구축에 필요한 라이브러리를 불러옵니다.
from flask import Flask, request, jsonify
# 테스트를 위하여 CORS를 처리합니다
from flask_cors import CORS

# 플라스크 웹 서버 객체 생성
app = Flask(__name__, static_folder = 'outputs')
CORS(app)

# 폰트 경로설정
font_path = 'NanumGothic.ttf'
plt.switch_backend('Agg')

def get_tags(text, max_count, min_length) : 
    # 명사만 추출
    t = Twitter()
    nouns = t.nouns(text)
    processed = [n for n in nouns if len(n) >= min_length]

    # 명사의 출현 빈도 계산
    count = Counter(processed)
    result = {}

    # 출현 빈도가 높은 max_count 개의 명사만을 추출
    for n,c in count.most_common(max_count) : 
        result[n] = c
    
    # 추출된 단어가 하나도 없는 경우 '내용이 없습니다' 화면 출력
    if len(result) == 0 : 
        result["내용이 없습니다."] = 1
    return result

def make_cloud_image(tags, file_name) :
    # 만들고자 하는 워드 클라우드의 기본 설정을 진행
    word_cloud = WordCloud(
        font_path=font_path,
        width=800,
        height=800,
        background_color="white"
    )

    # 추출된 단어 빈도수 목록을 이용해 워드 클라우드 객체 초기화
    word_cloud = word_cloud.generate_from_frequencies(tags)

    # 워드 클라우드 이미지 생성
    fig = plt.figure(figsize=(10, 10))
    plt.imshow(word_cloud)
    plt.axis("off")

    # 만들어진 이미지 객체를 파일 형태로 저장
    fig.savefig("outputs/{0}.png".format(file_name))

def process_from_text(text, max_count, min_length, words, file_name) : 
    # 최대 max_count개의 단어 및 등장 횟수 추출
    tags = get_tags(text, max_count, min_length)

    # 단어 가중치 적용
    for n,c in words.items() : 
        if n in tags : 
            tags[n] = tags[n] * int(words[n])
    
    # 명사 출현 빈도 정보를 통해 워드 클라우드 이미지 생성
    make_cloud_image(tags, file_name)


@app.route("/process", methods = ['GET','POST'])
def process():
    content = request.json
    words = {}
    if content['words'] is not None:
        for data in content['words'].values():
            words[data['word']] = data['weight']
    process_from_text(content['text'], content['maxCount'], content['minLength'], words, content['textID'])
    result = {'result': True}
    return jsonify(result)


@app.route('/outputs', methods=['GET', 'POST'])
def output():
    text_id = request.args.get('textID')
    return app.send_static_file(text_id + '.png')

@app.route('/validate', methods=['GET',' POST'])
def validate():
    text_id = request.args.get('textID')
    path = "outputs/{0}.png".format(text_id)
    result = {}
    # 해당 이미지 파일이 존재하는지 확인합니다.
    if os.path.isfile(path):
        result['result'] = True
    else:
        result['result'] = False
    return jsonify(result)

if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, threaded = True)