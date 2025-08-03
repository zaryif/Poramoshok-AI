# Poramoshok AI - Health & Fitness Advisor

A comprehensive AI-powered health and fitness advisory application built with React, TypeScript, and Google Gemini AI. The application provides personalized health recommendations, diet planning, exercise routines, and interactive health tracking.

## 🌟 Features

- **🤖 AI Chatbot**: Interactive health consultation powered by Google Gemini AI
- **🍎 Diet Planner**: Personalized meal plans and nutrition advice
- **💪 Exercise Planner**: Custom workout routines and fitness guidance
- **📊 Health Tracker**: Monitor your health metrics and progress
- **🎯 Fun Facts**: Educational health tips and interesting facts
- **🌍 Multi-language Support**: Available in multiple languages
- **🌙 Dark/Light Theme**: Customizable user interface

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/zaryif/Poramoshok-AI.git
   cd Poramoshok-AI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory and add your Gemini API key:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the application**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Build Tool**: Vite
- **AI Integration**: Google Gemini AI
- **Styling**: CSS3 with modern design patterns
- **Charts**: Recharts for data visualization
- **Image Generation**: html-to-image for sharing

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Chatbot.tsx     # AI chat interface
│   ├── DietPlanner.tsx # Meal planning component
│   ├── ExercisePlanner.tsx # Workout planning
│   ├── HealthTracker.tsx   # Health metrics tracking
│   ├── FunFact.tsx     # Health facts display
│   └── ...
├── contexts/           # React contexts
│   ├── LanguageContext.tsx
│   └── ThemeContext.tsx
├── hooks/             # Custom React hooks
├── services/          # API services
│   └── geminiService.ts
└── types.ts           # TypeScript type definitions
```

## 🔧 Configuration

### Environment Variables
- `VITE_GEMINI_API_KEY`: Your Google Gemini API key

### API Setup
1. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add it to your `.env.local` file
3. Restart the development server

## 📱 Usage

1. **Health Consultation**: Use the chatbot to get personalized health advice
2. **Diet Planning**: Get customized meal plans based on your goals
3. **Exercise Routines**: Receive workout plans tailored to your fitness level
4. **Health Tracking**: Monitor your progress with interactive charts
5. **Learning**: Discover health facts and tips

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini AI for providing the AI capabilities
- React and Vite communities for excellent tooling
- All contributors and users of this project

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact the maintainers.

---

**Made with ❤️ for better health and fitness**
