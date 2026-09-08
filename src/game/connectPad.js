export const CONNECT_PAD = { x: 5, z: 27, y: .96, radius: 1.35 }

// Only a grounded vehicle physically over the button may press it.
export function isConnectPadPressed(vehicle) {
  return vehicle.grounded && Math.abs(vehicle.y - CONNECT_PAD.y) < .65 &&
    Math.hypot(vehicle.x - CONNECT_PAD.x, vehicle.z - CONNECT_PAD.z) <= CONNECT_PAD.radius
}
