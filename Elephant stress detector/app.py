from flask import Flask, render_template, Response, jsonify
from camera import VideoCamera
from database import init_db, get_recent_logs, get_stats_last_7_days

app = Flask(__name__)
init_db()

# Dummy Elephant Profile
ELEPHANT_PROFILE = {
    "name": "Raja",
    "age": 45,
    "id": "E-001",
    "image": "https://placehold.co/400x400/2c4a3b/d4a017?text=Raja" # Placeholder for now
}

@app.route('/')
def index():
    return render_template('index.html', elephant=ELEPHANT_PROFILE)

@app.route('/info')
def info():
    return render_template('info.html')

@app.route('/api/history')
def history():
    # Return last 7 days for the chart
    logs = get_stats_last_7_days()
    return jsonify(logs)

def gen(camera):
    while True:
        frame = camera.get_frame()
        if frame:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(gen(VideoCamera()),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
