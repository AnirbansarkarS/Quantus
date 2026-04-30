# Quantus: Quantum Physics Visualizer

![React](https://img.shields.io/badge/React-19.2-blue?logo=react&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-Black?logo=threedotjs)


Quantus is an interactive learning platform that visualizes complex quantum mechanics and classical physics concepts. By blending 3D interactivity and live-action code playgrounds, Quantus makes learning physics engaging, accessible, and intuitive.

## 🌟 Features

Explore interactive simulations spanning classical mechanics and quantum computing:

- **Quantum Mechanics:**
  - 🌌 **Bloch Sphere Interactive Model**
  - 🌊 **Double Slit Experiment & Wave Interference**
  - ⚡ **Photoelectric Effect**
  - 📐 **Schrödinger Equation Visualizer**
  - 💻 **Qiskit Playground** (Live coding with Monaco Editor)
- **Classical Mechanics:**
  - 🚀 **Projectile Motion**
  - ⏱️ **Pendulum Dynamics**
  - 📉 **Spring Oscillator**
  - 🛸 **Antigravity Simulation**

## 💻 Tech Stack

- **Frontend:** React 19, React Router, Vite
- **3D & Physics:** Three.js, React Three Fiber, React Three Drei, Cannon-es
- **Styling:** Tailwind CSS V4
- **Editor:** Monaco Editor integration for live Qiskit coding
- **Icons:** Lucide React

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Quantus.git
   cd Quantus/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**  
   Navigate to `http://localhost:5173` (or the port specified by Vite) to see the app.

## 📂 Project Structure

- `/frontend` - The main React application built with Vite.
  - `/src/components/` - Interactive visualizations and UI components.
    - `BlochSphere.jsx`
    - `DoubleSlit.jsx`
    - `QiskitPlayground.jsx`
    - ...and more.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


