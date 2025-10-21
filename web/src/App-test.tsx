function App() {
  return (
    <div style={{ padding: '20px', backgroundColor: 'lightblue', minHeight: '100vh' }}>
      <h1>CourierCue Test</h1>
      <p>If you can see this, React is working!</p>
      <p>Environment: {import.meta.env?.VITE_LOCAL_DEV || 'undefined'}</p>
    </div>
  );
}

export default App;