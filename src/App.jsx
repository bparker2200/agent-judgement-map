import ProjectShape from "./ProjectShape.jsx";

// App just frames the page and renders the chart.
// Edit the data in ./projectData.js — not here.
export default function App() {
  return (
    <main className="app">
      <div className="app__inner">
        <ProjectShape />
      </div>
    </main>
  );
}
