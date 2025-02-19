from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import os

class RequestHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/list_music':
            # 获取音乐文件列表
            try:
                music_files = [f for f in os.listdir('music') if f.endswith('.mp3')]
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(music_files).encode())
                return
            except Exception as e:
                self.send_error(500, str(e))
                return
        return super().do_GET()

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))

        if self.path == '/save_article':
            # 保存文章
            self.save_article(data)
        elif self.path == '/save_introduction':
            # 保存简介
            self.save_introduction(data)
        elif self.path == '/save_tag':
            # 保存标签
            self.save_tag(data)

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'status': 'success'}).encode())

    def save_article(self, data):
        # 确保文章目录存在
        os.makedirs('article', exist_ok=True)
        # 生成文件名
        filename = f"article/{data['title'].replace(' ', '_')}.json"
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def save_introduction(self, data):
        # 保存简介
        os.makedirs('introduction', exist_ok=True)
        with open('introduction/content.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def save_tag(self, data):
        # 确保tags目录存在
        os.makedirs('tags', exist_ok=True)
        # 读取现有标签
        tags = []
        try:
            with open('tags/list.json', 'r', encoding='utf-8') as f:
                tags = json.load(f)
        except FileNotFoundError:
            pass

        # 添加新标签
        if data['tag'] not in tags:
            tags.append(data['tag'])

        # 保存更新后的标签列表
        with open('tags/list.json', 'w', encoding='utf-8') as f:
            json.dump(tags, f, ensure_ascii=False, indent=2)

if __name__ == '__main__':
    server_address = ('', 8000)
    httpd = HTTPServer(server_address, RequestHandler)
    print('Starting server on port 8000...')
    httpd.serve_forever()