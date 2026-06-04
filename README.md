# 🎓 Smart AI Academic Intelligence System

An advanced, full-stack predictive analytics and academic management platform built using the **MERN Stack** and **Python Machine Learning models**.

The platform enables educational institutions to proactively identify students at risk of academic failure or dropout, forecast future academic performance, and automate critical administrative workflows such as attendance tracking, internal marks management, and performance monitoring.

---

## 🚀 Features

* 📊 Student Failure Risk Prediction
* 🎯 Dropout Risk Assessment
* 📈 Next Semester CGPA Forecasting
* 👨‍🎓 Student Performance Analytics Dashboard
* 📝 Automated Attendance Management
* 📚 Internal Marks Distribution & Tracking
* 🔐 Role-Based Access Control (Student, Faculty, Admin)
* 📧 Automated Email Notifications
* 📂 Excel-Based Data Import & Processing
* 🤖 Machine Learning Powered Academic Intelligence
* 📜 Historical Prediction Logging & Analysis

---

# 🛠️ Tech Stack

## 🎨 Frontend

| Technology        | Purpose           |
| ----------------- | ----------------- |
| React.js (Vite)   | User Interface    |
| Tailwind CSS      | Styling           |
| React Router DOM  | Routing           |
| React Context API | State Management  |
| Axios             | API Communication |

---

## ⚙️ Backend

| Technology   | Purpose                |
| ------------ | ---------------------- |
| Node.js      | Runtime Environment    |
| Express.js   | REST API Framework     |
| MongoDB      | Database               |
| Mongoose ODM | Database Modeling      |
| JWT          | Authentication         |
| Bcrypt.js    | Password Hashing       |
| Node-cron    | Scheduled Tasks        |
| Multer       | File Uploads           |
| ExcelJS      | Spreadsheet Processing |
| Nodemailer   | Email Services         |

---

## 🤖 Machine Learning Layer

| Technology    | Purpose                     |
| ------------- | --------------------------- |
| Python 3.13   | ML Runtime                  |
| Scikit-Learn  | Model Training              |
| Pandas        | Data Processing             |
| NumPy         | Numerical Computation       |
| python-shell  | Node ↔ Python Communication |
| Pickle (.pkl) | Model Serialization         |

---

# 🧱 Project Architecture

The Smart AI Academic Intelligence System follows a **Decoupled Client–Server–Machine Learning Architecture**.

The React frontend communicates with the Express.js backend through REST APIs. The backend handles authentication, authorization, business logic, database operations, and ML orchestration. Predictive analytics tasks are delegated to Python-based ML services through the `python-shell` bridge.

```text
                      [ User / Client Browser ]
                                │   ▲
                 HTTPS Requests │   │ JSON Responses
                                ▼   │
                      [ Express.js Server ]
                                │   ▲
         Mongoose Queries /     │   │ Data Payload
         Document Mapping       ▼   │
                     [ MongoDB Database ]
                                │
          ┌─────────────────────┴─────────────────────┐
          │                                           │
          ▼                                           ▼
   [ python-shell Bridge ]                 [ Training Pipeline ]
          │                                           │
          ▼                                           ▼
   [ predict_dropout.py ]                [ train_dropout_model.py ]
          │                                           │
          └────────────► [ Model Artifacts (.pkl) ] ◄─┘
```

---

# 🔄 Application Flow

## 1️⃣ Authentication & Authorization

* JWT-based authentication
* Route-level authentication middleware
* Role-based authorization
* Student, Faculty, and Admin access levels

## 2️⃣ Academic Operations

* Attendance recording
* Internal marks management
* Student profile tracking
* Department-level analytics

## 3️⃣ Machine Learning Prediction Flow

1. User requests prediction.
2. Express API receives request.
3. Prediction controller triggers Python service.
4. Python loads trained `.pkl` models.
5. Prediction is generated.
6. Result is returned as JSON.
7. MongoDB stores prediction history.
8. Dashboard displays analytical insights.

---

# 🗃️ Database Schema Architecture

## User Schema

```javascript
{
  name: String,
  email: String,
  password: String,
  role: ["student", "faculty", "admin"],
  createdAt: Date
}
```

## Student Schema

```javascript
{
  user: ObjectId,
  rollNumber: String,
  department: ObjectId,
  semester: Number,
  cgpa: Number,
  attendancePercentage: Number,
  academicStatus: ["Active", "At Risk", "Critical"]
}
```

## Faculty Schema

```javascript
{
  user: ObjectId,
  employeeId: String,
  department: ObjectId,
  subjectsTaught: [ObjectId]
}
```

## Attendance Schema

```javascript
{
  student: ObjectId,
  subject: ObjectId,
  date: Date,
  status: ["Present", "Absent"],
  recordedBy: ObjectId
}
```

## Marks Schema

```javascript
{
  student: ObjectId,
  subject: ObjectId,
  examType: ["Internal-1", "Internal-2", "End-Semester"],
  marksObtained: Number,
  maxMarks: Number
}
```

## Prediction Schema

```javascript
{
  student: ObjectId,
  dropoutRiskProbability: Number,
  predictedNextCgpa: Number,
  keyRiskFactors: [String],
  generatedAt: Date
}
```

---

# 🤖 Machine Learning Sub-System

### train_dropout_model.py

Responsible for:

* Data preprocessing
* Feature engineering
* Dataset balancing
* Model training
* Model serialization

Outputs:

* `smart_ai_dropout_risk_model.pkl`
* `smart_ai_performance_model.pkl`

### predict_dropout.py

Responsible for:

* Loading trained models
* Processing live student metrics
* Generating dropout probability
* Forecasting future CGPA
* Returning structured JSON results

---

# ⚙️ Local Installation & Setup

## Prerequisites

* Node.js v18+
* MongoDB
* Python 3.10 – 3.13

### Clone Repository

```bash
git clone <repository-url>
cd Smart-AI-Academic-Intelligence-System
```

### Backend Setup

```bash
cd backend
npm install
```

Create `.env`

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart_academic_db
JWT_SECRET=YOUR_SECRET_KEY
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-app-password
```

### Install Python Dependencies

```bash
pip install -r ml/requirements.txt
```

### Seed Database & Train Models

```bash
node seed.js
npm run train:model
```

### Start Backend

```bash
npm run dev
```

### Frontend Setup

```bash
cd ../frontend
npm install
```

Create `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

Start Frontend

```bash
npm run dev
```

---

# 📈 Future Enhancements

* Deep Learning Models
* Student Recommendation Engine
* Parent Notification Portal
* LMS Integration
* Real-Time Risk Monitoring
* AI Academic Assistant

---

# 📄 License

This project is developed for educational, research, and institutional management purposes.
