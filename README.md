# GNN Anomaly Forecaster - PoC #2

[![Vercel Deployment](https://img.shields.io/vercel/deployment/ailabteam/gnn-network-forecaster?style=for-the-badge&logo=vercel)](https://gnn-network-forecaster.vercel.app/)
[![GitHub stars](https://img.shields.io/github/stars/ailabteam/gnn-network-forecaster?style=for-the-badge&logo=github)](https://github.com/ailabteam/gnn-network-forecaster/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/ailabteam/gnn-network-forecaster?style=for-the-badge&logo=github)](https://github.com/ailabteam/gnn-network-forecaster/issues)

**Live Demo: [gnn-network-forecaster.vercel.app](https://gnn-network-forecaster.vercel.app/)**

---

## 🧠 About This Project

This project is the second Proof-of-Concept (PoC) in my research series, building upon the hybrid architecture established in PoC #1. The **GNN Anomaly Forecaster** demonstrates the power of **Spatio-Temporal Graph Neural Networks (ST-GNNs)** for predictive anomaly detection in a simulated Satellite-Ground Integrated Network (SAGINs).

The core objective is to move beyond reactive monitoring and create an intelligent system that can **forecast potential network failures before they occur**.

### How It Works:
1.  **Dynamic Simulation:** The frontend simulates a dynamic network, allowing the user to inject anomalies (e.g., node overloads) with adjustable intensity.
2.  **Spatio-Temporal Analysis:** A sequence of recent network states (graph snapshots) is sent to a high-performance backend.
3.  **AI-Powered Prediction:** A pre-trained ST-GNN model (GCN-LSTM architecture) running on a GPU server analyzes the complex relationships between nodes and their changes over time.
4.  **Real-time Visualization:** The model's prediction—the probability of a system-wide anomaly—is sent back to the frontend, which then visualizes the risk by dynamically coloring the nodes on the network graph.

This demo highlights the capability of GNNs to learn and generalize complex network patterns, providing a powerful tool for proactive network management.

---

## 🎥 Video Demonstration

A detailed walkthrough of the user interface, the system architecture, and an analysis of the AI model's behavior is available on YouTube.

[![YouTube Demo Video Thumbnail](https://img.youtube.com/vi/YOUTUBE_VIDEO_ID_HERE/0.jpg)](https://www.youtube.com/watch?v=YOUTUBE_VIDEO_ID_HERE)

> **Note:** Please replace `YOUTUBE_VIDEO_ID_HERE` with the actual ID of your YouTube video.

---

## 🏛️ Architecture

This PoC leverages the same robust hybrid architecture as PoC #1, proving its capability to handle complex AI/ML workloads.

-   **Frontend (React on Vercel):** The interactive dashboard built with React, TypeScript, and React Flow.
-   **Proxy Gateway (Vercel Serverless):** A lightweight FastAPI proxy that securely forwards requests to the compute backend.
-   **Compute Server (Dedicated GPU Server):** The core of the system, responsible for:
    -   Generating and preprocessing the training dataset.
    -   Training the ST-GNN model using PyTorch and PyTorch Geometric (PyG).
    -   Serving the trained model for real-time inference via a FastAPI API.

---

## ✨ Features

-   **Interactive Network Graph:** A dynamic visualization of the SAGINs network topology using React Flow.
-   **Anomaly Injection:** A control panel to select a target node and adjust the intensity of the simulated anomaly.
-   **Real-time AI Forecasting:** The system calls the GNN model every few seconds to get an updated anomaly probability.
-   **Dynamic Risk Visualization:** Nodes on the graph change color (Normal, Warning, Anomaly) based on the AI's risk assessment.
-   **Detailed Explanations:** An "About" panel integrated into the UI to explain the project's purpose and functionality.

---

## 🚀 Getting Started

This project consists of two main parts: the Vercel-deployable application (Frontend + Proxy) and the offline Compute Server (Data Generation, Training, and Inference).

### Vercel Application (This Repository)
-   Contains the React frontend, the FastAPI proxy (`/api`), and all necessary Vercel configurations.
-   Ready to be deployed directly from this repository.

### Compute Server (Offline Setup)
-   **Location:** The code for the compute server (`data_generator.py`, `train.py`, `main.py`, etc.) is managed locally on the GPU server and is not part of this repository.
-   **Key Steps:**
    1.  Create a dedicated Conda environment (`poc_gnn`).
    2.  Install heavy dependencies: `pytorch`, `torch_geometric`, `pandas`, `poliastro`, etc.
    3.  Run `data_generator.py` to create the training dataset and test payloads.
    4.  Run `train.py` to train the ST-GNN model, which saves the `stgnn_v1.pth` file.
    5.  Run the FastAPI inference server `main.py` on a specific port (e.g., `8888`).
    6.  Ensure the server port is open to external traffic.

---

## 🤝 Collaboration

This research is an ongoing effort. If you are interested in Graph Neural Networks, satellite communications, or predictive AI systems, I would be delighted to connect. Please open an issue for technical discussions or reach out via my professional channels.

---
_This project is part of a personal R&D initiative by [Do Phuc Hao](https://github.com/ailabteam)._
