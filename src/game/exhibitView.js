// Shared by the world display and its camera; fit the entire board inside the
// viewport with room for navigation above and reading controls below.
export function exhibitView(width, height, focused = true) {
  const portrait = width / height < 0.85
  const boardWidth = focused ? (portrait ? 5.4 : 7.6) : 2.8
  const boardHeight = focused ? (portrait ? 7.2 : 5.7) : 1.6
  const usableHeight = Math.max(0.4, (height - 210) / height)
  const usableWidth = Math.max(0.6, (width - 40) / width)
  const tangent = Math.tan(50 * Math.PI / 360)
  const distance = Math.max(boardHeight / (2 * tangent * usableHeight), boardWidth / (2 * tangent * width / height * usableWidth)) * 1.04
  return { portrait, boardWidth, boardHeight, centerY: focused ? 4.8 : 2.4, distance }
}
