import { useEffect, useState } from "react";

const CountdownLoader = () => {
  const [seconds, setSeconds] = useState(50);

  useEffect(() => {
    if (seconds > 0) {
      const interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [seconds]);

  return (
    <div style={styles.container}>
      <div style={styles.loader}>
        <p>Connecting to server...</p>
        <p style={styles.text}>{seconds} seconds remaining</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f0f0f0",
  },
  loader: {
    backgroundColor: "#007bff",
    padding: "20px",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    margin: 0,
  },
};

export default CountdownLoader;
