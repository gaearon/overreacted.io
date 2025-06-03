import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export async function generateHomeImage() {
  return generateImage(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        backgroundColor: "rgb(40, 44, 53)",
        color: "white",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 150,
          width: "100%",
          height: "100%",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 80,
        }}
      >
        <span
          style={{
            backgroundImage: "linear-gradient(45deg, #ffb3d8, #cbb6ff)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          Ozipi.dev
        </span>
        <span
          style={{
            fontFamily: "Merriweather",
            fontStyle: "italic",
            fontSize: 60,
            alignItems: "center",
          }}
        >
          <img
            alt="Oscar Valdez"
            src="https://github.com/ozipi.png"
            style={{
              height: 120,
              width: 120,
              borderRadius: "50%",
              marginLeft: 20,
            }}
          />
        </span>
      </div>
    </div>,
  );
}

export async function generatePostImage({ title }) {
  return generateImage(
    <div
      style={{
        padding: 40,
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: "rgb(40, 44, 53)",
        color: "white",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 40,
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: 20,
        }}
      >
        <span
          style={{
            backgroundImage: "linear-gradient(45deg, #ffb3d8, #cbb6ff)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            fontSize: 60,
          }}
        >
          Ozipi.dev
        </span>
        <span
          style={{
            fontFamily: "Merriweather",
            fontStyle: "italic",
            fontSize: 35,
            alignItems: "center",
          }}
        >
          by
          <img
            alt="Oscar Valdez"
            src="https://github.com/ozipi.png"
            style={{
              height: 80,
              width: 80,
              borderRadius: "50%",
              marginLeft: 20,
            }}
          />
        </span>
      </div>
      <div
        style={{
          fontSize: 90,
          display: "flex",
          alignItems: "center",
          flex: 1,
          paddingBottom: 30,
        }}
      >
        {title}
      </div>
    </div>,
  );
}

async function generateImage(jsx) {
  return new ImageResponse(jsx, {
    ...size,
    fonts: [
      {
        name: "Montserrat",
        data: await montserratExtraBold,
        style: "normal",
        weight: 900,
      },
      {
        name: "Merriweather",
        data: await merriweatherRegular,
        style: "normal",
        weight: 500,
      },
      {
        name: "Merriweather",
        data: await merriweatherItalic,
        style: "italic",
        weight: 500,
      },
    ],
  });
}

const montserratExtraBold = readFile(
  join(process.cwd(), "og/Montserrat-ExtraBold.ttf"),
);
const merriweatherRegular = readFile(
  join(process.cwd(), "og/Merriweather-Regular.ttf"),
);
const merriweatherItalic = readFile(
  join(process.cwd(), "og/Merriweather-Italic.ttf"),
);
