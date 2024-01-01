import { getAccel } from "./sensor";
import { DataPoint, Vector3, makePlots } from "./src/graph";
import "./style.css";

const html = String.raw;

const appEl = document.querySelector<HTMLDivElement>("#app")!;
const msgEl = document.createElement("div");
appEl.append(msgEl);

const calibrateText = "calibrate";

const createRange = () => {
  const range = document.createElement("input");
  range.type = "range";
  const r = 0.5;
  range.min = `-${r}`;
  range.max = `${r}`;
  range.step = "0.001";
  appEl.append(range);
  range.style.display = "block";
  range.disabled = true;
  return range;
};

const run = async () => {
  let lastTimestamp: number | undefined = undefined;
  let calibrationOffset = { x: 0, y: 0, z: 0 };
  const accelerometer = await getAccel();
  const calibrateBtn = document.createElement("button");
  calibrateBtn.textContent = calibrateText;
  appEl.append(calibrateBtn);
  const xVelo = createRange();
  const yVelo = createRange();
  const zVelo = createRange();

  let requestedCalibration = false;
  let velo = Vector3.zero();
  let pos = Vector3.zero();
  let dataset: DataPoint[] = [];
  calibrateBtn.addEventListener("click", () => {
    calibrateBtn.textContent = "calibrating";
    // wait until vibrations from tap should have settled
    setTimeout(() => {
      requestedCalibration = true;
    }, 1000);
  });
  accelerometer.addEventListener("reading", () => {
    let rawAccel = {
      x: accelerometer.x,
      y: accelerometer.y,
      z: accelerometer.z,
    };
    let timestamp = accelerometer.timestamp;
    if (
      rawAccel.x === undefined ||
      rawAccel.y === undefined ||
      rawAccel.z === undefined ||
      timestamp === undefined
    )
      return;

    if (requestedCalibration) {
      calibrationOffset.x = rawAccel.x;
      calibrationOffset.y = rawAccel.y;
      calibrationOffset.z = rawAccel.z;
      velo = Vector3.zero();
      pos = Vector3.zero();
      dataset = [];
      calibrateBtn.textContent = calibrateText;
      requestedCalibration = false;
    }
    const accel = new Vector3(
      rawAccel.x - calibrationOffset.x,
      rawAccel.y - calibrationOffset.y,
      rawAccel.z - calibrationOffset.z,
    );
    let dt: number | undefined;
    if (lastTimestamp) {
      dt = (timestamp - lastTimestamp) / 1000;
      velo = velo.plus(accel.times(dt));
      pos = pos.plus(velo.times(dt));
      xVelo.valueAsNumber = velo.x;
      yVelo.valueAsNumber = velo.y;
      zVelo.valueAsNumber = velo.z;
      const velocityMagnitude = velo.magnitude();
      const vals = {
        accel,
        velo: {
          x: round(velo.x),
          y: round(velo.y),
          z: round(velo.z),
        },
        // pos: {
        //   x: round(pos.x),
        //   y: round(pos.y),
        //   z: round(pos.z),
        // },
        velocityMagnitude: round(velocityMagnitude),
        dt: round(dt),
      };
      msgEl.innerHTML = html`<pre>${JSON.stringify(vals, null, 2)}</pre>`;
      dataset.push({ timestamp, velocity: velo, acceleration: accel });
      makePlots(appEl, dataset);
    }
    lastTimestamp = timestamp;
  });
  accelerometer.start();
};

const round = (input: number) => Math.round(input * 100) / 100;

try {
  await run();
} catch (e) {
  console.log(e);
  msgEl.textContent = String(e);
}
