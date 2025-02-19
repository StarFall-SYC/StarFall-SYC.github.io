import http.server
import socketserver
import json
import os

class ArticleHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/article/StarFall/articles.json':
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                articles = json.loads(post_data)

                # 确保目录存在
                os.makedirs('article/StarFall', exist_ok=True)

                # 保存文章
                with open('article/StarFall/articles.json', 'w', encoding='utf-8') as f:
                    json.dump(articles, f, ensure_ascii=False, indent=4)

                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'success'}).encode())
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())
        else:
            super().do_POST()

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

if __name__ == '__main__':
    PORT = 8000
    with socketserver.TCPServer(("", PORT), ArticleHandler) as httpd:
        print(f"Server running at http://localhost:{PORT}")
        httpd.serve_forever()