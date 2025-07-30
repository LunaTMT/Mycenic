import React from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles"; // keep this

export default function StarParticles() {
  // No explicit type on engine param
  const particlesInit = async (engine: any) => {
    await loadFull(engine); // loads all plugins
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: {
          enable: false,
        },
        background: {
          color: {
            value: "transparent",
          },
        },
        particles: {
          number: {
            value: 50,
            density: {
              enable: true,
              area: 800,
            },
          },
          color: {
            value: "#FFD700", // gold
          },
          shape: {
            type: "polygon",
            polygon: {
              sides: 10,
            },
          },
          opacity: {
            value: 0.8,
          },
          size: {
            value: 3,
          },
          move: {
            enable: true,
            speed: 2,
            direction: "none",
            outModes: {
              default: "bounce",
            },
          },
        },
        detectRetina: true,
      }}
    />
  );
}
