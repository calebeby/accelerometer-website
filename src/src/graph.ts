import * as Plot from "@observablehq/plot";

const html = String.raw;
export interface DataPoint {
  timestamp: number;
  velocity: Vector3;
  acceleration: Vector3;
}

const findOrMakeEl = (id: string, app: Element) => {
  const prevEl = app.querySelector(`& > #${id}`);
  if (prevEl) return prevEl;
  const el = document.createElement("div");
  el.id = id;
  app.append(el);
  return el;
};

export const makePlots = (app: Element, data: DataPoint[]) => {
  const box = findOrMakeEl("chart-1", app);
  box.innerHTML = "";
  box.append(
    Plot.plot({
      marks: [
        Plot.ruleY([0]),
        Plot.lineY(data, {
          x: {
            value: (d: DataPoint) => (d.timestamp - data[0].timestamp) / 1000,
            label: "Timestamp (s)",
          },
          y: {
            value: (d: DataPoint) => d.velocity.y,
            label: "Velocity Y-component (m/s)",
          },
        }),
        Plot.frame(),
      ],
    }),
  );
  const infoEl = findOrMakeEl("chart-info", app);
  infoEl.innerHTML = html`
    <h1>
      Max y-component of velocity (m/s):
      ${Math.max(...data.map((d) => d.velocity.y))}
    </h1>
  `;
};

export class Vector3 {
  public x = 0;
  public y = 0;
  public z = 0;

  static zero() {
    return new Vector3(0, 0, 0);
  }

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  magnitude(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
  }

  times(scalar: number) {
    return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  plus(other: Vector3) {
    return new Vector3(this.x + other.x, this.y + other.y, this.z + other.z);
  }
}
