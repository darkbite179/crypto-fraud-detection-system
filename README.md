# 🚀 Crypto Fraud Detection System  
### Real-Time Hybrid ML + Rule-Based Transaction Intelligence Engine  

---

## 🏆 Hackathon Submission | Production-Oriented FinTech Architecture  

A real-time fraud detection system designed to identify suspicious crypto and financial transactions using a **Hybrid Intelligence Model**:

- 🧠 Machine Learning Detection Engine (Primary)  
- 🛡 Rule-Based Risk Engine (Fallback)  
- ⚡ FastAPI Real-Time Backend  
- 📊 Behavioral Feature Engineering  
- 🔐 API Key Security Layer  
- 📈 Confidence Scoring & Risk Classification  

This system simulates enterprise-level fintech fraud monitoring architecture.

---

## 📌 Problem Statement  

Digital and crypto transactions are:

- Instant  
- Irreversible  
- High-value  
- Frequently targeted by fraud  

Traditional systems rely only on static rules.  
Modern systems require behavioral ML-based intelligence.

This project combines:

- ✅ Behavioral anomaly detection  
- ✅ Risk scoring  
- ✅ Rule-based emergency protection  
- ✅ Real-time API decisioning  

---

## 🧠 System Architecture  

```
Frontend / Client
        ↓
FastAPI Backend (app.py)
        ↓
ML Engine (predictor.py)
        ↓
Feature Engineering Pipeline
        ↓
Model Loader
        ↓
Fraud Probability Scoring
        ↓
Threshold Decision Logic
        ↓
Rule-Based Fallback (if ML fails)
        ↓
Structured API Response
```

---

## 📊 Fraud Classification Engine  

The system classifies transactions into three risk levels:

| Risk Level | Decision | Description |
|------------|----------|------------|
| 🟢 Low | Allow | Normal transaction |
| 🟡 Medium | Flag | Suspicious, requires review |
| 🔴 High | Block | High-confidence fraud |

This multi-tier classification mimics real-world fintech decision systems.

---

## 📷 System Demonstration  

### 🟢 Case 1 – Allowed Transaction  

A transaction within expected behavioral patterns.

<br><br>

<img width="1344" height="796" alt="image" src="https://github.com/user-attachments/assets/9ba9a60f-6eb8-4fa2-9f79-ead92cc9c9dc" />


<br><br><br>

**Example Output**

```
Engine: ML
Decision: Allow
Risk Level: Low
Confidence Score: 0.17
Latency: 0.004s
```

---

### 🟡 Case 2 – Flagged Transaction (Suspicious)  

Moderate anomaly detected but below fraud threshold.

<br><br>
<img width="1424" height="748" alt="image" src="https://github.com/user-attachments/assets/770a6802-dcf7-4e6c-be50-8f27f768d150" />


<br><br><br>

**Example Output**

```
Engine: ML
Decision: Flag
Risk Level: Medium
Confidence Score: 0.62
Latency: 0.005s
```

---

### 🔴 Case 3 – Fraudulent Transaction  

High-risk behavioral anomaly detected:

- Large transaction spike  
- Night-time anomaly  
- New device  
- New location  
- High transaction velocity  

<br><br>

<img width="1276" height="816" alt="image" src="https://github.com/user-attachments/assets/de477dc4-74d7-4059-ae43-ba0ddddd76d6" />


<br><br><br>

**Example Output**

```
Engine: ML
Decision: Block
Risk Level: High
Confidence Score: 0.94
Latency: 0.004s
```

---

## ⚙️ Technical Stack  

### Backend
- FastAPI  
- Uvicorn  
- Pydantic  

### Machine Learning
- Scikit-Learn  
- Pandas  
- NumPy  
- Custom Feature Engineering Pipeline  

### Architecture Principles
- Modular ML Engine  
- Separation of Concerns  
- Hybrid Detection System  
- Fallback Mechanism  
- API Security  
- Structured Logging  

---

## 🔍 Fraud Detection Logic  

The ML model evaluates:

- Transaction amount deviation  
- User historical average comparison  
- Time-of-day anomaly detection  
- New device detection  
- New location detection  
- Transaction burst velocity (10-minute window)  
- Behavioral pattern shift  

The final decision is made using:

- Fraud probability score  
- Configurable risk thresholds  
- Business logic override rules  

---

## 🔐 Security & Reliability Features  

- API Key Authentication  
- Fraud Logging for Audit Trail  
- ML Engine Failure Protection  
- Rule-Based Emergency Fallback  
- Structured Error Handling  
- Latency Monitoring  

Designed with reliability similar to production fintech systems.

---

## 📂 Project Structure  

```
backend/
│
├── app.py
├── rule_based_detector.py
├── requirements.txt
│
└── ml_engine/
      ├── predictor.py
      ├── model_loader.py
      ├── feature_engineering.py
      ├── saved_model.pkl
```

---

## 🚀 Run Locally  

```bash
pip install -r requirements.txt
python -m uvicorn app:app --reload
```

Access API documentation:

```
http://127.0.0.1:8000/docs
```

---

## 🏗 Scalability Roadmap  

Future production enhancements:

- Kafka-based transaction streaming  
- PostgreSQL audit storage  
- SHAP explainability layer  
- Docker containerization  
- Cloud deployment (AWS/GCP/Azure)  
- Real-time monitoring dashboard  

---

## 🎯 Why This Project Stands Out  

✔ Hybrid ML + Rule-Based Architecture  
✔ Real-Time API System  
✔ Multi-Level Risk Classification  
✔ Production-Oriented Folder Structure  
✔ Modular & Scalable Design  
✔ Hackathon-Ready & Deployment-Ready  

This is not just a demo — it is an architecture blueprint for a fintech fraud monitoring system.

---

## 👨‍💻 Hackathon Team  

Crypto Fraud Intelligence Engine  
Real-Time Risk Detection Architecture  

---

## ⭐ Support  

If you found this project interesting, consider giving it a ⭐ on GitHub.
