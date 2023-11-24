from flask import Flask, send_from_directory, send_file, request
from curl_cffi import requests
import io
import zipfile
import os
import json
from flask import send_file
import uuid

def unzipone (zip_bytes: bytes):
  bytes_io = io.BytesIO(zip_bytes)

  with zipfile.ZipFile(bytes_io, 'r') as zip_file:
    file_names = zip_file.namelist()
    if file_names:
        # 假设只有一个文件，获取这个文件的名称
        file_name = file_names[0]
        # 读取这个文件的内容
        file_data = zip_file.read(file_name)

        return file_data

nai_session = requests.Session()
proxies = {
  "https": "http://127.0.0.1:1081"
}

app = Flask(__name__,
            static_folder='../frontend/dist',  # 设置静态文件夹为前端构建目录
            template_folder='../frontend/dist') # 设置模板目录为前端构建目录

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')
    
@app.route('/api/generate-image', methods=['POST'])
def generate_image():
    json_text = request.get_data(as_text=True)
    json_data = json.loads(json_text)
    
    authorization = json_data['authorization']
    nai_param = json_data['nai_param']

    headers = {
        'origin': 'https://novelai.net',
        'referer': 'https://novelai.net/',
        'authorization': authorization
    }

    res = nai_session.post(
        'https://api.novelai.net/ai/generate-image',
        impersonate="chrome110",
        proxies=proxies,
        json=nai_param,
        headers=headers,
        timeout=60
    )

    try:
        pngdata = unzipone(res.content)
        img_filename = str(uuid.uuid4()) + '.png'

        with open('../frontend/dist/' + img_filename, 'wb') as file:
            file.write(pngdata)

        return img_filename
    except:
        print(res.text)
        return None

if __name__ == '__main__':
    app.run(debug=False, port=5001)
