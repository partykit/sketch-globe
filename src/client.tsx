import createGlobe from "cobe";
import "./styles.css";

import { useEffect, useRef, type LegacyRef } from "react";

declare const PARTYKIT_HOST: string;

import { createRoot } from "react-dom/client";
import usePartySocket from "partysocket/react";
import type { OutgoingMessage } from "./server";

type Positions = Map<string, Marker>;

type Marker = {
  location: [number, number];
  size: number;
};

function App() {
  const canvasRef = useRef<HTMLCanvasElement>();
  const positions = useRef<Positions>(new Map());
  const socket = usePartySocket({
    room: "default",
    onMessage(evt) {
      const message = JSON.parse(evt.data) as OutgoingMessage;
      if (message.type === "add-marker") {
        positions.current.set(message.position.id, {
          location: [message.position.lat, message.position.lng],
          size: message.position.id === socket.id ? 0.1 : 0.05,
        });
      } else if (message.type === "remove-marker") {
        positions.current.delete(message.id);
      }
    },
  });
  useEffect(() => {
    let phi = 0;

    const globe = createGlobe(canvasRef.current as HTMLCanvasElement, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.3, 0.3, 0.3],
      markerColor: [0.1, 0.8, 1],
      glowColor: [0.2, 0.2, 0.2],
      markers: [
        // longitude latitude
        { location: [37.7595, -122.4367], size: 0.03 },
        { location: [40.7128, -74.006], size: 0.1 },
      ],
      onRender: (state) => {
        // Called on every animation frame.
        // `state` will be an empty object, return updated params.

        state.markers = [...positions.current.values()];
        state.phi = phi;
        phi += 0.01;
      },
    });

    return () => {
      globe.destroy();
    };
  }, []);

  return (
    <div className="App">
      <h1>Where's everyone at?</h1>
      <canvas
        ref={canvasRef as LegacyRef<HTMLCanvasElement>}
        style={{ width: 600, height: 600, maxWidth: "100%", aspectRatio: 1 }}
      />

      <p>
        Powered by <a href="https://cobe.vercel.app/">🌏 Cobe</a> and{" "}
        <a href="https://partykit.io/">🎈PartyKit</a>
      </p>
      {/* <p>
        Code:{" "}
        <a href="https://github.com/partykit/sketch-globe">
          https://github.com/partykit/sketch-globe
        </a>
      </p> */}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
