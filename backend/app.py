"""
Honeypot Security Monitor - Backend API

A minimal, read-only FastAPI service that serves parsed honeypot analytics
to the frontend dashboard. This API acts as a clean boundary between the
data processing layer (Cowrie log parser) and the visualization layer (React).

Architecture:
    VM Cowrie Logs -> Parser -> C:/honeypot-data/parsed_output/*.json -> This API -> Frontend

Security Notes:
    - This API is READ-ONLY by design
    - Intended for localhost access only (do NOT expose to internet)
    - No authentication implemented (internal analytics service)
    - JSON files are trusted internal artifacts from the parser

Usage:
    uvicorn app:app --reload --host 127.0.0.1 --port 8000
"""

import json
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware


# =============================================================================
# Configuration
# =============================================================================

# Data directory: VirtualBox shared folder where parser outputs JSON files.
# This is the bridge between the VM (Cowrie logs) and the host (this API).
DATA_DIR = Path(r"C:\Users\thoma\Desktop\Hons Project\honeypot-data\parsed_output")

# Data file paths
ATTACK_SUMMARY_FILE = DATA_DIR / "attack_summary.json"
COMMANDS_STATS_FILE = DATA_DIR / "commands_stats.json"
SESSIONS_FILE = DATA_DIR / "sessions.json"


# =============================================================================
# Application Setup
# =============================================================================

app = FastAPI(
    title="Honeypot Security Monitor API",
    description="Read-only API serving parsed honeypot analytics data",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration for local development.
# Allows the React frontend (running on different port) to access this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://127.0.0.1:5176",
    ],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)


# =============================================================================
# Helper Functions
# =============================================================================

def load_json_file(file_path: Path) -> Any:
    """
    Load and parse a JSON file.

    Args:
        file_path: Path to the JSON file

    Returns:
        Parsed JSON content (list or dict)

    Raises:
        HTTPException: If file is missing or contains invalid JSON
    """
    if not file_path.exists():
        raise HTTPException(
            status_code=503,
            detail=f"Data file not available: {file_path.name}. "
                   f"Ensure the parser has generated output in {DATA_DIR}"
        )

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Invalid JSON in {file_path.name}: {str(e)}"
        )
    except IOError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error reading {file_path.name}: {str(e)}"
        )


# =============================================================================
# Data Transformation Functions
# =============================================================================

def transform_attacks(raw_attacks: list) -> list:
    """
    Transform attack_summary.json from parser format to frontend format.

    Parser format: {ip, attack_type, failed_logins, succesful_login (bool), unique_sessions, ...}
    Frontend format: {source_ip, attack_type, failed_logins, successful_logins (int), session_count, ...}
    """
    transformed = []
    for attack in raw_attacks:
        transformed.append({
            "source_ip": attack.get("ip", "unknown"),
            "attack_type": attack.get("attack_type", "RECON"),
            "failed_logins": attack.get("failed_logins", 0),
            "successful_logins": 1 if attack.get("succesful_login", False) else 0,
            "session_count": attack.get("unique_sessions", 0),
            "first_seen": attack.get("first_seen"),
            "last_seen": attack.get("last_seen"),
        })
    return transformed


def transform_sessions(raw_sessions: dict) -> list:
    """
    Transform sessions.json from parser format to frontend format.

    Parser format: {session_id: [{time, command, src_ip}, ...], ...}
    Frontend format: [{session_id, source_ip, auth_success, commands: [{timestamp, command}], ...}, ...]
    """
    transformed = []
    for session_id, commands in raw_sessions.items():
        if not commands:
            continue

        # Extract source_ip from first command
        source_ip = commands[0].get("src_ip", "unknown") if commands else "unknown"

        # Get timestamps for duration calculation
        timestamps = [cmd.get("time") for cmd in commands if cmd.get("time")]
        start_time = min(timestamps) if timestamps else None
        end_time = max(timestamps) if timestamps else None

        # Transform commands to expected format
        transformed_commands = [
            {
                "timestamp": cmd.get("time"),
                "command": cmd.get("command", ""),
                "input": cmd.get("command", ""),
            }
            for cmd in commands
        ]

        transformed.append({
            "session_id": session_id,
            "source_ip": source_ip,
            "start_time": start_time,
            "end_time": end_time,
            "auth_success": len(commands) > 0,  # If commands exist, assume auth succeeded
            "commands": transformed_commands,
        })

    return transformed


def categorize_command(command: str) -> str:
    """Categorize a command based on its content."""
    cmd_lower = command.lower().strip()

    # Reconnaissance commands
    if any(x in cmd_lower for x in ["ls", "pwd", "whoami", "id", "uname", "cat /etc", "ps ", "netstat", "ifconfig", "ip addr"]):
        return "reconnaissance"

    # Privilege escalation
    if any(x in cmd_lower for x in ["sudo", "su ", "chmod", "chown"]):
        return "privilege_escalation"

    # Persistence
    if any(x in cmd_lower for x in ["crontab", "systemctl", ".bashrc", ".profile", "authorized_keys"]):
        return "persistence"

    # Download/Transfer
    if any(x in cmd_lower for x in ["wget", "curl", "scp", "ftp", "tftp", "nc "]):
        return "download"

    # Credential access
    if any(x in cmd_lower for x in ["passwd", "/etc/shadow", "/etc/passwd", "ssh-keygen"]):
        return "credential_access"

    # System modification
    if any(x in cmd_lower for x in ["rm ", "mv ", "cp ", "mkdir", "touch", "apt", "yum", "pip"]):
        return "system_modification"

    # Exit/Navigation
    if any(x in cmd_lower for x in ["exit", "logout", "cd "]):
        return "navigation"

    return "other"


def transform_commands(raw_commands: list) -> list:
    """
    Transform commands_stats.json from parser format to frontend format.

    Parser format: [[command, count], ...]
    Frontend format: [{command, count, category}, ...]
    """
    transformed = []
    for item in raw_commands:
        if isinstance(item, list) and len(item) >= 2:
            command = item[0]
            count = item[1]
            transformed.append({
                "command": command,
                "count": count,
                "category": categorize_command(command),
            })
    return transformed


# =============================================================================
# API Endpoints
# =============================================================================

@app.get("/")
async def root():
    """
    Health check endpoint.
    Returns API status and data directory configuration.
    """
    return {
        "service": "Honeypot Security Monitor API",
        "status": "operational",
        "data_directory": str(DATA_DIR),
        "endpoints": ["/api/overview", "/api/attacks", "/api/commands", "/api/sessions"]
    }


@app.get("/api/overview")
async def get_overview():
    """
    Get derived summary statistics from attack data.

    Computes aggregate metrics from attack_summary.json:
    - total_attacks: Count of unique attack records
    - unique_ips: Count of distinct source IP addresses
    - attack_types: Breakdown by classification
    - login_stats: Aggregate login attempt statistics

    Returns:
        JSON object with computed overview metrics
    """
    # Load and transform data
    raw_attacks = load_json_file(ATTACK_SUMMARY_FILE)
    raw_sessions = load_json_file(SESSIONS_FILE)
    raw_commands = load_json_file(COMMANDS_STATS_FILE)

    attacks = transform_attacks(raw_attacks)
    sessions = transform_sessions(raw_sessions)
    commands = transform_commands(raw_commands)

    # Compute aggregate statistics
    unique_ips = set()
    attack_type_counts = {"RECON": 0, "BRUTE_FORCE": 0, "COMPROMISED": 0}
    total_failed_logins = 0
    total_successful_logins = 0

    for attack in attacks:
        unique_ips.add(attack.get("source_ip"))
        attack_type = attack.get("attack_type", "RECON")
        if attack_type in attack_type_counts:
            attack_type_counts[attack_type] += 1
        total_failed_logins += attack.get("failed_logins", 0)
        total_successful_logins += attack.get("successful_logins", 0)

    # Session statistics
    total_sessions = len(sessions)
    authenticated_sessions = sum(1 for s in sessions if s.get("auth_success"))
    total_commands_executed = sum(len(s.get("commands", [])) for s in sessions)

    # Command category breakdown
    category_counts = {}
    for cmd in commands:
        category = cmd.get("category", "unknown")
        category_counts[category] = category_counts.get(category, 0) + cmd.get("count", 0)

    return {
        "total_attacks": len(attacks),
        "unique_ips": len(unique_ips),
        "attack_types": attack_type_counts,
        "brute_force_count": attack_type_counts["BRUTE_FORCE"],
        "compromised_count": attack_type_counts["COMPROMISED"],
        "total_failed_logins": total_failed_logins,
        "total_successful_logins": total_successful_logins,
        "total_sessions": total_sessions,
        "authenticated_sessions": authenticated_sessions,
        "total_commands_executed": total_commands_executed,
        "command_categories": category_counts,
    }


@app.get("/api/attacks")
async def get_attacks():
    """
    Get full attack summary data.

    Returns the complete contents of attack_summary.json, containing
    per-attacker aggregated data including:
    - source_ip: Attacker's IP address
    - attack_type: Classification (RECON, BRUTE_FORCE, COMPROMISED)
    - failed_logins: Count of failed authentication attempts
    - successful_logins: Count of successful authentications
    - first_seen / last_seen: Timestamps of activity window
    - session_count: Number of sessions from this IP

    Returns:
        JSON array of attack summary objects
    """
    raw_attacks = load_json_file(ATTACK_SUMMARY_FILE)
    return transform_attacks(raw_attacks)


@app.get("/api/commands")
async def get_commands():
    """
    Get command execution statistics.

    Returns the complete contents of commands_stats.json, containing
    frequency data for commands executed by attackers:
    - command: The command string
    - count: Number of times executed
    - category: Classification (reconnaissance, credential_access, etc.)

    Returns:
        JSON array of command statistics objects
    """
    raw_commands = load_json_file(COMMANDS_STATS_FILE)
    return transform_commands(raw_commands)


@app.get("/api/sessions")
async def get_sessions():
    """
    Get detailed session data.

    Returns the complete contents of sessions.json, containing
    per-session information including:
    - session_id: Unique session identifier
    - source_ip: Attacker's IP address
    - start_time / end_time: Session timestamps
    - duration_seconds: Session length
    - auth_success: Whether authentication succeeded
    - username_attempted: Username used in auth attempt
    - commands: Array of commands executed (with timestamps)

    Returns:
        JSON array of session objects
    """
    raw_sessions = load_json_file(SESSIONS_FILE)
    return transform_sessions(raw_sessions)


# =============================================================================
# Entry Point
# =============================================================================

if __name__ == "__main__":
    import uvicorn

    print(f"Data directory: {DATA_DIR}")
    print(f"Attack summary: {ATTACK_SUMMARY_FILE} (exists: {ATTACK_SUMMARY_FILE.exists()})")
    print(f"Commands stats: {COMMANDS_STATS_FILE} (exists: {COMMANDS_STATS_FILE.exists()})")
    print(f"Sessions file:  {SESSIONS_FILE} (exists: {SESSIONS_FILE.exists()})")
    print()

    uvicorn.run(
        "app:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )
