from flask import Flask, request, jsonify

app = Flask(__name__)

@app.get('/')
def home():
    q = (request.args.get('q','') or '')
    idv = (request.args.get('id','') or '')
    if "<script>" in q.lower():
        q = q.replace("<script>","").replace("</script>","")
    if "' or '1'='1" in idv.lower():
        return ("blocked", 403)
    return f"q={q} id={idv}"

@app.post('/api/find')
def find():
    data = request.get_json(silent=True) or {}
    idv = (str(data.get('id','')) or '')
    if "' or '1'='1" in idv.lower():
        return ("blocked", 403)
    return jsonify({"ok": True, "id": idv})

if __name__ == "__main__":
    print("Starting test target on 127.0.0.1:8000")
    app.run(host='127.0.0.1', port=8000)
