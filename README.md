# 🍯 Cowrie Honeypot Deployment & Analysis

> A practical cybersecurity project focused on deploying and monitoring a **Cowrie SSH/Telnet honeypot** to capture, analyze, and understand real-world attack behavior.

---

## 📖 Overview

This project demonstrates the deployment of a **Cowrie honeypot**, a medium-interaction SSH and Telnet honeypot designed to log brute-force attacks and attacker activity.

The goal of this project is to simulate a vulnerable system, observe malicious behavior in a controlled environment, and gain insights into common attack patterns used by threat actors.

---

## 🎯 Objectives

* Deploy a fully functional Cowrie honeypot
* Capture real-time attacker interactions
* Analyze login attempts and command execution
* Understand common brute-force strategies
* Explore attacker behavior post-compromise

---

## ✨ Features

* 🔐 Emulates SSH and Telnet services
* 📊 Logs attacker sessions and commands
* 📁 Stores detailed interaction data
* 🌐 Real-world attack simulation
* 🧠 Useful for cybersecurity research and learning

---

## 🧰 Tech Stack

* **Honeypot:** Cowrie
* **Environment:** Linux (Ubuntu/Kali recommended)
* **Language:** Python
* **Logging:** JSON / Log files
* **Tools:** Git, Virtual Environment

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/rachuzzzz/Honeypot-Cowrie-.git
cd Honeypot-Cowrie-
```

### 2️⃣ Install Dependencies

```bash
sudo apt update
sudo apt install git python3 python3-venv python3-pip -y
```

### 3️⃣ Setup Virtual Environment

```bash
python3 -m venv cowrie-env
source cowrie-env/bin/activate
```

### 4️⃣ Install Cowrie

```bash
git clone https://github.com/cowrie/cowrie.git
cd cowrie
pip install --upgrade pip
pip install -r requirements.txt
```

### 5️⃣ Configure Cowrie

```bash
cp etc/cowrie.cfg.dist etc/cowrie.cfg
```

Modify configuration as needed (ports, logging, etc.).

---

## ▶️ Running the Honeypot

```bash
cd cowrie
bin/cowrie start
```

To stop:

```bash
bin/cowrie stop
```

---

## 📊 Logs & Data Collection

Cowrie stores logs in:

```
cowrie/var/log/
```

Key files include:

* `cowrie.log` → General activity
* `cowrie.json` → Structured logs for analysis
* Session recordings for attacker interactions

---

## 🧠 Analysis Insights

Using the collected data, you can:

* Identify most targeted usernames/passwords
* Track attacker IP addresses
* Analyze executed commands
* Study post-login behavior

This helps in understanding real-world cyber attack techniques.

---

## 📸 Sample Output

*Add screenshots or logs of captured sessions here*

---

## ⚠️ Disclaimer

This project is intended for **educational and research purposes only**.

Do not expose the honeypot to the public internet without proper security measures. The author is not responsible for misuse.

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push and open a Pull Request

---

## 🛡 License

This project follows the **MIT License**.

---

## 👨‍💻 Author

**Raisen Thomas**
GitHub: https://github.com/rachuzzzz

---

## ⭐ Support

If you found this project helpful, consider giving it a **star ⭐**!
