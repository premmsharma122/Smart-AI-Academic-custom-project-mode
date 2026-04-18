# Custom project-aligned AI model

This folder contains:
- `raw_data/uci_dropout_base_dataset.csv` -> public base dataset used as the source
- `model_artifacts/smart_ai_risk_training_dataset.csv` -> project-aligned training CSV for dropout risk
- `model_artifacts/smart_ai_performance_training_dataset.csv` -> project-aligned training CSV for next-semester CGPA
- `model_artifacts/smart_ai_dropout_risk_model.pkl` -> trained dropout risk classifier
- `model_artifacts/smart_ai_performance_model.pkl` -> trained next-semester CGPA regressor
- `train_dropout_model.py` -> rebuilds the training CSVs and retrains both models
- `predict_dropout.py` -> returns dropout risk + performance prediction from project-style student inputs
