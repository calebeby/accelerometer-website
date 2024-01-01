export const getAccel = async (): Promise<LinearAccelerationSensor> => {
  if (!("LinearAccelerationSensor" in window))
    throw new Error("Sensor is not supported by the User Agent");
  const permission = await navigator.permissions.query({
    name: "accelerometer" as any,
  });
  if (permission.state === "denied")
    throw new Error("Permission not granted to use sensor (NotAllowedError)");

  let accelerometer: LinearAccelerationSensor | null = null;
  try {
    accelerometer = new LinearAccelerationSensor({
      referenceFrame: "device",
      frequency: 1000,
    });
    accelerometer.addEventListener("error", (event) => {
      if (event.error.name === "NotAllowedError") {
        throw new Error(
          "Permission not granted to use sensor (NotAllowedError)",
        );
      } else if (event.error.name === "NotReadableError") {
        throw new Error("Cannot connect to the sensor.");
      }
    });
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    if (error.name === "SecurityError") {
      throw new Error("Permission not granted to use sensor (SecurityError)");
    }
    throw error;
  }
  return accelerometer;
};
