from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import os

class RequestHandler(SimpleHTTPRequestHandler):
    def send_error(self, code, message=None):
        try:
            super().send_error(code, message)
        except UnicodeEncodeError:
            # 处理Unicode编码错误
            self.send_response(code)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            error_content = f'<html><head><title>Error {code}</title></head><body><h1>Error {code}</h1><p>{message}</p></body></html>'
            self.wfile.write(error_content.encode('utf-8'))

    def do_GET(self):
        if self.path == '/list_music':
            try:
                music_files = []
                for f in os.listdir('music'):
                    if f.endswith('.mp3'):
                        file_path = os.path.join('music', f)
                        try:
                            with open(file_path, 'rb') as test_file:
                                test_file.read(1024)
                            music_files.append({
                                'name': f,
                                'size': os.path.getsize(file_path),
                                'last_modified': os.path.getmtime(file_path)
                            })
                        except Exception:
                            continue
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(music_files).encode())
                return
            except Exception as e:
                self.send_error(500, str(e))
                return
        elif self.path.startswith('/music/'):
            try:
                file_name = os.path.basename(self.path)
                file_name = file_name.replace('%20', ' ')
                file_name = file_name.replace('%26', '&')
                file_path = os.path.join('music', file_name)
                
                if os.path.exists(file_path) and os.path.isfile(file_path):
                    with open(file_path, 'rb') as f:
                        self.send_response(200)
                        self.send_header('Content-type', 'audio/mpeg')
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.send_header('Accept-Ranges', 'bytes')
                        self.send_header('Cache-Control', 'public, max-age=3600')
                        self.end_headers()
                        self.wfile.write(f.read())
                    return
                else:
                    self.send_error(404, 'File not found')
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