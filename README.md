# LiftLog 🏋️‍♂️

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

LiftLog is a social weightlifting tracker that allows users to log their lifts, track progress over time, and compete on a community leaderboard. Built with modern web technologies, it features real-time updates, interactive charts, and a sleek, responsive design.

## 🚀 Features

-   **Workout Logging**: easily log your lifts (Squat, Bench, Deadlift, etc.) with weight, reps, and RPE.
-   **Progress Tracking**: Visualize your strength gains over time with interactive charts.
-   **1RM Calculation**: Automatically estimates your One-Rep Max based on your logs.
-   **Body Weight Tracking**: Keep track of your body weight alongside your lifts.
-   **Leaderboard**: Compete with other users! See top lifts by category.
-   **Social Interactions**: Like and comment on other users' lifts to build a supportive community.
-   **User Profiles**: customizable profiles with avatars and lift history.
-   **Dark/Light Mode**: Toggle between themes for your preferred viewing experience.

## 🛠️ Tech Stack

-   **Frontend**: [Next.js 14](https://nextjs.org/) (App Router), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
-   **Backend / Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage, Realtime)
-   **Styling**: CSS Modules, `lucide-react` for icons
-   **Charts**: `recharts`
-   **Utilities**: `sonner` (toasts), `canvas-confetti` (celebrations)

## 🏁 Getting Started

Follow these steps to get the project running on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or newer)
-   [npm](https://www.npmjs.com/) (or yarn/pnpm)
-   A [Supabase](https://supabase.com/) account and project

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/liftlog.git
cd liftlog
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

The project relies on Supabase for authentication and data storage. You need to configure your environment variables.

1.  Create a file named `.env.local` in the root directory.
2.  Copy the following template and fill in your Supabase credentials:

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Note:** The `.env.local` file is git-ignored to protect your secrets. Do not commit it to the repository.

### 4. Database Setup

You need to set up the database schema in Supabase.

1.  Go to your Supabase project dashboard.
2.  Navigate to the **SQL Editor**.
3.  Open the `schema.sql` file located in the root of this project.
4.  Copy the contents of `schema.sql` and paste them into the SQL Editor.
5.  Run the query to create all necessary tables, policies, and functions.

### 5. Run the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🚀 Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

### 1. Push to GitHub

Make sure your project is pushed to a GitHub repository.

### 2. Import to Vercel

1.  Go to [Vercel.com](https://vercel.com) and sign up/log in.
2.  Click **Add New...** > **Project**.
3.  Select your GitHub repository (`liftlog`).
4.  Click **Import**.

### 3. Configure Environment Variables

In the "Configure Project" step:

1.  Expand the **Environment Variables** section.
2.  Add the same variables from your `.env.local` file:
    -   `NEXT_PUBLIC_SUPABASE_URL`
    -   `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Deploy

Click **Deploy**. Vercel will build your application and provide you with a live URL (e.g., `https://liftlog-yourname.vercel.app`).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
