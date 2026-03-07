# AI Satellite Monitor

![AI Satellite Monitor](https://user-images.githubusercontent.com/3369400/273909015-a76412c9-a868-4b72-8438-54a72d3f7529.png)

AI-assisted geospatial monitoring and multi-hazard risk assessment platform with a mock-first, live-upgrade design. This platform ships with working dashboards immediately (using deterministic mock data) and allows for progressive upgrades to live data sources (like weather, air quality, satellite imagery, and models) as you add your API keys.

## ✨ Features

-   **Real-time Environmental Analysis**: Ingest and analyze various environmental data streams.
-   **Multi-Hazard Risk Assessment**: AI-powered predictions for various environmental hazards.
-   **Interactive Map Dashboard**: A rich, interactive, and modern frontend built with Next.js and Mapbox.
-   **Scalable Backend**: A robust backend powered by Python and FastAPI, designed for high performance.
-   **Mock-First Design**: Get up and running instantly with mock data, and switch to live data sources as you need.
-   **Extensible Architecture**: Easily add new data sources, machine learning models, or API endpoints.

## 🚀 Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Make sure you have the following installed on your system:

-   [Node.js](https://nodejs.org/) (v18 or higher)
-   [Python](https://www.python.org/) (v3.9 or higher)
-   `pip` (Python package installer)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/msrishav-28/ai-satellite-monitor.git
    cd ai-satellite-monitor
    ```

2.  **Set up environment variables:**

    The project uses `.env` files for configuration. Example files are provided.

    -   Copy the root `.env.example` to `.env`:
        ```bash
        cp .env.example .env
        ```
    -   Copy the backend `.env.example` to `.env`:
        ```bash
        cp backend/.env.example backend/.env
        ```
    -   Copy the frontend `.env.local.example` to `.env.local`:
        ```bash
        cp space/.env.example space/.env.local
        ```

    After copying, you'll need to edit these files to add your own API keys and configuration (e.g., Mapbox access token).

3.  **Install dependencies:**

    **Frontend (`space/`):**
    ```bash
    cd space
    npm install --legacy-peer-deps
    cd ..
    ```

    **Backend:**
    It is recommended to use a Python virtual environment for the backend dependencies.
    ```bash
    cd backend
    python -m venv venv
    
    # On Windows:
    .\venv\Scripts\activate
    # On macOS/Linux:
    source venv/bin/activate
    
    pip install -r requirements.txt
    cd ..
    ```
4.  **Run the development servers:**

    You can start both the frontend and backend servers concurrently using the provided script.

    -   On macOS/Linux:
        ```bash
        ./scripts/start-dev.sh
        ```
    -   On Windows:
        ```bat
        .\scripts\start-dev.bat
        ```

    This will start:
    -   The **Frontend** (Next.js) on `http://localhost:3000`
    -   The **Backend** (FastAPI) on `http://localhost:8000`

## 🛠️ Tech Stack

-   **Frontend**:
    -   [Next.js](https://nextjs.org/) - React Framework
    -   [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript
    -   [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
    -   [Mapbox](https://www.mapbox.com/) - for interactive maps
    -   [Framer Motion](https://www.framer.com/motion/) - for animations

-   **Backend**:
    -   [Python](https://www.python.org/)
    -   [FastAPI](https://fastapi.tiangolo.com/) - High-performance web framework
    -   [Uvicorn](https://www.uvicorn.org/) - ASGI server

## 📂 Project Structure

```
.
├── backend/         # FastAPI backend application
│   ├── app/         # Core application logic
│   ├── .env.example
│   └── requirements.txt
├── space/           # Next.js 15 cinematic frontend (single source of truth)
│   ├── src/
│   ├── public/
│   ├── .env.example
│   └── package.json
├── scripts/         # Development scripts
│   ├── start-dev.sh
│   └── start-dev.bat
├── .env.example     # Root environment variables
└── package.json     # Root package manager for concurrent execution
``` 

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.