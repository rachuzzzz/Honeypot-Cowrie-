import json
from collections import defaultdict, Counter
from datetime import datetime
from pathlib import Path

# ========================= CONFIG =========================

LOG_DIR = Path("/home/cowrie/cowrie/var/log/cowrie")
LOG_FILES = sorted(LOG_DIR.glob("cowrie.json*"))
OUTPUT_DIR = Path("/media/sf_honeypot-data/parsed_output")
OUTPUT_DIR.mkdir(exist_ok=True)

# ========================= DATA STRUCTURES =========================

ips = defaultdict(lambda: {
    "events": [],
    "failed_logins": 0,
    "successful_login": False,
    "commands": Counter(),
    "sessions": set(),
    "first_seen": None,
    "last_seen": None
})

sessions = defaultdict(list)
global_commands = Counter()
global_passwords = Counter()

# ========================= HELPERS =========================

def parse_time(ts):
    try:
        return datetime.fromisoformat(ts.replace("Z", ""))
    except Exception:
        return None

def update_time(ip_data, ts):
    if not ts:
        return

    if not ip_data["first_seen"] or ts < ip_data["first_seen"]:
        ip_data["first_seen"] = ts

    if not ip_data["last_seen"] or ts > ip_data["last_seen"]:
        ip_data["last_seen"] = ts

# ========================= PARSER =========================

def parse_logs():
    ips.clear()
    sessions.clear()
    global_commands.clear()
    global_passwords.clear()

    for log_file in LOG_FILES:
        with log_file.open() as f:
            for line in f:
                try:
                    event = json.loads(line)
                except json.JSONDecodeError:
                    continue

                event_id = event.get("eventid")
                src_ip = event.get("src_ip")
                session = event.get("session")
                timestamp = parse_time(event.get("timestamp"))

                if not src_ip:
                    continue

                ip_data = ips[src_ip]
                update_time(ip_data, timestamp)

                if session:
                    ip_data["sessions"].add(session)

                # -------- CONNECTION --------
                if event_id == "cowrie.session.connect":
                    ip_data["events"].append({
                        "type": "connect",
                        "time": timestamp.isoformat() if timestamp else None
                    })

                # -------- FAILED LOGIN --------
                elif event_id == "cowrie.login.failed":
                    ip_data["failed_logins"] += 1

                    password = event.get("password")
                    if password:
                        global_passwords[password] += 1

                    ip_data["events"].append({
                        "type": "login_failed",
                        "username": event.get("username"),
                        "password": event.get("password"),
                        "time": timestamp.isoformat() if timestamp else None
                    })

                # -------- SUCCESSFUL LOGIN --------
                elif event_id == "cowrie.login.success":
                    password = event.get("password")

                    if password:
                        global_passwords[password] += 1

                    ip_data["successful_login"] = True

                    ip_data["events"].append({
                        "type": "login_success",
                        "username": event.get("username"),
                        "password": event.get("password"),
                        "time": timestamp.isoformat() if timestamp else None
                    })

                # -------- COMMAND INPUT --------
                elif event_id == "cowrie.command.input":
                    command = event.get("input")

                    if command and session:
                        ip_data["commands"][command] += 1
                        global_commands[command] += 1

                        sessions[session].append({
                            "time": timestamp.isoformat() if timestamp else None,
                            "command": command,
                            "src_ip": src_ip
                        })

# ========================= EXPORT =========================

def export_results():
    attack_summary = []

    for ip, data in ips.items():
        if data["successful_login"]:
            attack_type = "COMPROMISED"
        elif data["failed_logins"] > 0:
            attack_type = "BRUTE_FORCE"
        else:
            attack_type = "RECON"

        attack_summary.append({
            "ip": ip,
            "attack_type": attack_type,
            "failed_logins": data["failed_logins"],
            "successful_login": data["successful_login"],
            "unique_sessions": len(data["sessions"]),
            "first_seen": data["first_seen"].isoformat() if data["first_seen"] else None,
            "last_seen": data["last_seen"].isoformat() if data["last_seen"] else None
        })

    with open(OUTPUT_DIR / "attack_summary.json", "w") as f:
        json.dump(attack_summary, f, indent=2)

    with open(OUTPUT_DIR / "commands_stats.json", "w") as f:
        json.dump(global_commands.most_common(), f, indent=2)

    with open(OUTPUT_DIR / "password_stats.json", "w") as f:
        json.dump(global_passwords.most_common(), f, indent=2)

    with open(OUTPUT_DIR / "sessions.json", "w") as f:
        json.dump(sessions, f, indent=2)

# ========================= MAIN =========================

if __name__ == "__main__":
    print("[+] Parsing Cowrie logs")
    parse_logs()

    print("[+] Exporting structured results")
    export_results()

    print("[✓] Done. Data available in parsed_output/")
