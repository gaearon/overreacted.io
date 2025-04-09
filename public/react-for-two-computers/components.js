export function Wrapper({ children }) {
  return (
    <div
      style={{
        "--jaggedTopPath": `polygon(${generateJaggedTopPath()})`,
        "--jaggedBottomPath": `polygon(${generateJaggedBottomPath()})`,
      }}
    >
      {children}
    </div>
  );
}

export function Server({ children }) {
  return (
    <div
      style={{
        "--path": "var(--jaggedBottomPath)",
        "--radius-bottom": 0,
        "--padding-bottom": "1.2rem",
      }}
    >
      {children}
    </div>
  );
}

export function Client({ children, glued }) {
  return (
    <div
      style={{
        "--path": "var(--jaggedTopPath)",
        "--radius-top": 0,
        "--padding-top": "1.2rem",
        position: "relative",
        marginTop: glued ? -30 : 0,
      }}
    >
      {children}
    </div>
  );
}

const jaggedSliceCount = 50;

function generateJaggedBottomPath() {
  let path = [
    ["0%", "0%"],
    ["100%", "0%"],
    ["100%", "100%"],
  ];
  let left = 100;
  let top = 100;
  for (let i = 0; i < jaggedSliceCount; i++) {
    left -= 100 / jaggedSliceCount;
    path.push([`${left}%`, i % 2 === 0 ? `calc(${top}% - 5px)` : `${top}%`]);
  }
  path.push(["0%", "100%"]);
  return path.map((pair) => pair.join(" ")).join(",");
}

function generateJaggedTopPath() {
  let path = [["0%", "5px"]];
  let left = 0;
  for (let i = 0; i < jaggedSliceCount; i++) {
    left += 100 / jaggedSliceCount;
    path.push([`${left}%`, i % 2 === 1 ? "5px" : "0"]);
  }
  path.push(["100%", "5px"]);
  path.push(["100%", "100%"]);
  path.push(["0%", "100%"]);
  return path.map((pair) => pair.join(" ")).join(",");
}
