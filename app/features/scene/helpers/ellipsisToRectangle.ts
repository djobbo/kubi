interface Ellipse {
  majorRadius: number // Semi-major axis (a)
  minorRadius: number // Semi-minor axis (b)
  rotation: number // Rotation angle in radians
}

interface Rectangle {
  width: number
  height: number
}

// Function to get Inscribed and Circumscribed Rectangles of a rotated ellipse
export function getInscribedAndCircumscribedRectangles(ellipse: Ellipse): {
  inscribed: Rectangle
  circumscribed: Rectangle
} {
  const { majorRadius, minorRadius, rotation } = ellipse

  // Step 1: Calculate the circumscribed rectangle
  // Circumscribed Rectangle: Axis-aligned bounding box (AABB) for the rotated ellipse
  // This rectangle is the smallest that can completely contain the rotated ellipse.
  const cosTheta = Math.cos(rotation)
  const sinTheta = Math.sin(rotation)

  // Width and height of circumscribed rectangle, projected along x and y axes
  const circumscribedWidth =
    Math.abs(majorRadius * cosTheta) + Math.abs(minorRadius * sinTheta)
  const circumscribedHeight =
    Math.abs(majorRadius * sinTheta) + Math.abs(minorRadius * cosTheta)

  const circumscribed: Rectangle = {
    width: 2 * circumscribedWidth, // Multiply by 2 to get full axis length (not semi-axes)
    height: 2 * circumscribedHeight,
  }

  // Step 2: Calculate the inscribed rectangle
  // Inscribed Rectangle: The largest rectangle that can fit inside the ellipse
  // This rectangle is rotated along with the ellipse, so we calculate the projection of the ellipse's axes.

  // The inscribed rectangle is constrained by the ellipse equation
  // Find the maximum width and height of a rectangle within the ellipse's rotated bounds
  const angleMajor = Math.atan2(minorRadius * sinTheta, majorRadius * cosTheta)
  const angleMinor = Math.atan2(minorRadius * cosTheta, majorRadius * sinTheta)

  const inscribedWidth =
    2 *
    Math.min(
      Math.abs(majorRadius * Math.cos(angleMajor)),
      Math.abs(minorRadius * Math.sin(angleMajor)),
    )
  const inscribedHeight =
    2 *
    Math.min(
      Math.abs(majorRadius * Math.sin(angleMinor)),
      Math.abs(minorRadius * Math.cos(angleMinor)),
    )

  const inscribed: Rectangle = {
    width: inscribedWidth,
    height: inscribedHeight,
  }

  return { inscribed, circumscribed }
}
