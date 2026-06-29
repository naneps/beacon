from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
import threading
import time
import json
import os
import uuid
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from core.tester import TestConfig, EndpointTest, APITester

app = Flask(__name__)
app.config['SECRET_KEY'] = 'security-tools-secret'
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

CONFIG_FILE = 'config/tests.json'
current_config = TestConfig()
current_runs = {}  # run_id -> info

def load_config():
    global current_config
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, 'r') as f:
            data = json.load(f)
            current_config = TestConfig.from_dict(data)
    else:
        # default example - ready for most auth flows
        current_config = TestConfig(
            base_url="https://api.retailku.com",
            variables={"access_token": "", "refresh_token": ""},
            tests=[
                EndpointTest(None, "Login", "/auth/login", "POST",
                             {"Content-Type": "application/json"},
                             {"email": "test@example.com", "password": "Password123!"},
                             "json"),
                EndpointTest(None, "Onboarding", "/onboarding", "POST",
                             {"Authorization": "Bearer {{access_token}}", "Content-Type": "application/json"},
                             {"name": "Test User", "phone": "+6281234567890", "address": "Jl. Example"},
                             "json")
            ]
        )
        save_config()

def save_config():
    os.makedirs('config', exist_ok=True)
    with open(CONFIG_FILE, 'w') as f:
        json.dump(current_config.to_dict(), f, indent=2)

load_config()

def log_message(run_id, message):
    ts = datetime.now().strftime("%H:%M:%S")
    entry = f"[{ts}] {message}"
    if run_id in current_runs:
        current_runs[run_id]['logs'].append(entry)
    socketio.emit('log_update', {'run_id': run_id, 'message': entry})

def update_stats(run_id, stats):
    if run_id in current_runs:
        current_runs[run_id]['stats'] = stats
    socketio.emit('stats_update', {'run_id': run_id, 'stats': stats})

def run_test(run_id, test_id, concurrency, delay, max_requests, use_min_delay):
    test = next((t for t in current_config.tests if t.id == test_id), None)
    if not test:
        log_message(run_id, "Test not found")
        return

    if use_min_delay:
        delay = 0.001

    current_runs[run_id] = {
        'status': 'running',
        'logs': [],
        'stats': {'attempts': 0, 'success': 0, 'rate_limited': 0, 'errors': 0},
        'stop_flag': {'stop': False}
    }

    tester = APITester(
        test, current_config,
        concurrency=concurrency,
        delay=delay,
        max_requests=max_requests,
        log_callback=lambda m: log_message(run_id, m),
        stats_callback=lambda s: update_stats(run_id, s),
        stop_flag=current_runs[run_id]['stop_flag']
    )

    try:
        results = tester.run()
        log_message(run_id, f"Finished: {results}")
    except Exception as e:
        log_message(run_id, f"Error: {e}")
    finally:
        current_runs[run_id]['status'] = 'finished'
        socketio.emit('run_finished', {'run_id': run_id})

@app.route('/')
def index():
    return render_template('index.html', config=current_config.to_dict())

@app.route('/config', methods=['GET'])
def get_config():
    return jsonify(current_config.to_dict())

@app.route('/config', methods=['POST'])
def save_config_route():
    data = request.json
    global current_config
    current_config = TestConfig.from_dict(data)
    save_config()
    return jsonify({"status": "saved", "config": current_config.to_dict()})

@app.route('/tests', methods=['POST'])
def add_test():
    data = request.json
    test = EndpointTest.from_dict(data)
    current_config.tests.append(test)
    save_config()
    return jsonify(test.to_dict())

@app.route('/tests/<test_id>', methods=['PUT'])
def update_test(test_id):
    data = request.json
    for i, t in enumerate(current_config.tests):
        if t.id == test_id:
            current_config.tests[i] = EndpointTest.from_dict(data)
            save_config()
            return jsonify(current_config.tests[i].to_dict())
    return jsonify({"error": "not found"}), 404

@app.route('/tests/<test_id>', methods=['DELETE'])
def delete_test(test_id):
    current_config.tests = [t for t in current_config.tests if t.id != test_id]
    save_config()
    return jsonify({"status": "deleted"})

@app.route('/tests/<test_id>/duplicate', methods=['POST'])
def duplicate_test(test_id):
    orig = next((t for t in current_config.tests if t.id == test_id), None)
    if not orig:
        return jsonify({"error": "not found"}), 404
    new_test = EndpointTest(
        None,
        f"{orig.name} (copy)",
        orig.url,
        orig.method,
        dict(orig.headers),
        dict(orig.payload),
        orig.payload_type
    )
    current_config.tests.append(new_test)
    save_config()
    return jsonify(new_test.to_dict())

@app.route('/run', methods=['POST'])
def start_run():
    data = request.json
    test_id = data['test_id']
    concurrency = int(data.get('concurrency', 1))
    delay = float(data.get('delay', 0.1))
    max_requests = int(data.get('max_requests', 100))
    use_min_delay = data.get('use_min_delay', False)

    run_id = str(uuid.uuid4())
    current_runs[run_id] = {
        'status': 'running',
        'logs': [],
        'stats': {'attempts': 0, 'success': 0, 'rate_limited': 0, 'errors': 0},
        'stop_flag': {'stop': False}
    }

    thread = threading.Thread(target=run_test, args=(run_id, test_id, concurrency, delay, max_requests, use_min_delay))
    thread.daemon = True
    thread.start()

    return jsonify({"run_id": run_id})

@app.route('/stop/<run_id>', methods=['POST'])
def stop_run(run_id):
    if run_id in current_runs:
        current_runs[run_id]['stop_flag']['stop'] = True
        current_runs[run_id]['status'] = 'stopped'
    return jsonify({"status": "stopping"})

@app.route('/status/<run_id>')
def get_status(run_id):
    if run_id not in current_runs:
        return jsonify({"error": "not found"}), 404
    run = current_runs[run_id]
    return jsonify({
        "status": run['status'],
        "stats": run['stats'],
        "logs": run['logs'][-100:]  # last 100
    })

if __name__ == '__main__':
    os.makedirs('config', exist_ok=True)
    print("\n" + "="*50)
    print("  Security Tools - Dynamic API Dashboard")
    print("  http://localhost:5000")
    print("  (Press CTRL+C to stop)")
    print("="*50 + "\n")
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)