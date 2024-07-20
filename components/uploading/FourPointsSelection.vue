<script setup lang="ts">
import {useCanvas} from "~/composibles/useCanvas";
import {type Ref, useAttrs} from "vue";
import type {FourPoints, Point} from "~/types/cvtypes";

type Props = {
  image: string,
  pointSpacing: number,
  suggestedContour?: FourPoints
  strokeStyle?: string,
  fillStyle?: string,
  lineWidth?: number,
  pointRadius?: number,
  pointFill?: string,
  canvasMaxHeight?: number,
  canvasMaxWidth?: number,
}

const props = defineProps<Props>()
const attrs = useAttrs()

const origin: Point = {
  x: 0,
  y: 0
} as const

const canvas = ref<HTMLCanvasElement>()
const model = defineModel<FourPoints>()
const modelPainted = ref<FourPoints>()
let canvasController = ref<ReturnType<typeof useCanvas>>();

// called when image changes
watch(() => props.image,
  () => {
    canvasController.value = undefined
    modelPainted.value = undefined
  }
)

watchEffect(() => {
  if (!props.suggestedContour || !canvasController.value?.imageLoaded) {
    return
  }
  // convert raw to image
  modelPainted.value = props.suggestedContour.map(p => {
    const [x, y] = canvasController.value!.rawToPainted(p.x, p.y)
    return {x, y}
  }) as FourPoints
})

// called when canvas is ready
watchEffect(() => {
  canvasController.value
  if (!canvas.value) {
    return;
  }
  canvasController.value = useCanvas(canvas as Ref<HTMLCanvasElement>, {
    strokeStyle: props.strokeStyle,
    fillStyle: props.fillStyle,
    lineWidth: props.lineWidth,
    pointRadius: props.pointRadius,
    pointFill: props.pointFill,
    width: props.canvasMaxWidth,
    height: props.canvasMaxHeight
  })
})

// called when canvasController is ready
watchEffect(() => {
  if (!canvasController.value) {
    return;
  }
  canvasController.value!.prepareImage(props.image)
})

// called when image is ready
watchEffect(() => {
  [canvasController.value, modelPainted.value]
  if (!canvasController.value || !canvasController.value.imageLoaded) {
    return;
  }

  if (!modelPainted.value) {
    const w = canvasController.value?.paintedImageWidth!
    const h = canvasController.value?.paintedImageHeight!
    modelPainted.value = [
      {x: 0, y: 0},
      {x: w, y: 0},
      {x: w, y: h},
      {x: 0, y: h}
    ]
  }

  canvasController.value?.drawImage(() => canvasController.value?.drawFourPoints(modelPainted.value!))
})


watchEffect(() => {
  if (modelPainted.value && canvasController.value?.imageLoaded) {
    model.value = modelPainted.value.map(
        point => {
          const [x, y] = canvasController.value!.paintedToRaw(point.x, point.y)
          return {x, y}
        }
    ) as FourPoints
  }
})

// dragging logic (-1 means no point is dragged)
const draggingIndex = ref(-1)
const clamper = ref<(from: Point, to: Point) => Point>()

/**
 * Euclidean distance between two points
 *
 * @param p1
 * @param p2
 */
function distance(p1: Point, p2: Point) {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
}

/**
 * Solve two-variable system of equations
 *
 * @param row1
 * @param row2
 */
function gaussianElimination(row1: [number, number, number], row2: [number, number, number]): Point {
  if (row1[0] === 0) {
    const temp = row1
    row1 = row2
    row2 = temp
  }

  const [a, b, c] = row1,
      [d, e, f] = row2

  // division of 0 if both a and d are 0. But in this case either there are no solutions or infinitely many
  const y = (a * f - d * c) / (a * e - d * b)

  return {
    x: (c - b * y) / a,
    y
  }
}

/**
 * Sort the points into clockwise rotation.
 */
function sortPoints() {
  const currentPoint = modelPainted.value![draggingIndex.value],
      oppositePoint = modelPainted.value![(draggingIndex.value + 2) % modelPainted.value!.length],
      neighbor1 = modelPainted.value![(draggingIndex.value + 3) % modelPainted.value!.length],
      neighbor2 = modelPainted.value![(draggingIndex.value + 1) % modelPainted.value!.length]

  const u = {x: neighbor2.y - neighbor1.y, y: neighbor1.x - neighbor2.x},
      uMag = distance(u, origin),
      v = {x: u.x / uMag, y: u.y / uMag}

  const r1 = {x: neighbor2.x + v.x, y: neighbor2.y + v.y},
      r2 = {x: neighbor2.x - v.x, y: neighbor2.y - v.y},
      dist1 = distance(oppositePoint, r1),
      dist2 = distance(oppositePoint, r2)

  // counterclockwise
  if (dist1 < dist2) {
    return {
      A: neighbor2,
      B: oppositePoint,
      C: neighbor1,
      D: currentPoint
    }
  }

  return {
    A: neighbor1,
    B: oppositePoint,
    C: neighbor2,
    D: currentPoint
  }
}

/**
 * Returns a function that corrects a point's position
 * if invalid
 */
function getAreaToLive() {
  if (!modelPainted.value) {
    return;
  }

  const {A, B, C} = sortPoints()
  const {x: x1, y: y1} = B,
      {x: x2, y: y2} = A,
      {x: x3, y: y3} = C

  const u1 = {x: y1 - y3, y: x3 - x1},
      u2 = {x: y1 - y2, y: x2 - x1},
      u3 = {x: y3 - y2, y: x2 - x3},
      u1Mag = distance(u1, origin),
      u2Mag = distance(u2, origin),
      u3Mag = distance(u3, origin),
      v1 = {x: u1.x / u1Mag * 50, y: u1.y / u1Mag * 50},
      v2 = {x: u2.x / u2Mag * 50, y: u2.y / u2Mag * 50},
      v3 = {x: u3.x / u3Mag * 50, y: u3.y / u3Mag * 50}

  const P = {x: x1 - v1.x, y: y1 - v1.y},
      Q = {x: x1 + v2.x, y: y1 + v2.y},
      R = {x: x3 + v3.x, y: y3 + v3.y}

  const constrains: [number, number, number][] = [
    [y1 - y3, x3 - x1, P.y * (x3 - x1) - P.x * (y3 - y1)],
    [y1 - y2, x2 - x1, Q.y * (x2 - x1) - Q.x * (y2 - y1)],
    [y3 - y2, x2 - x3, R.y * (x2 - x3) - R.x * (y2 - y3)]
  ]

  function clamp(from: Point, to: Point): Point {
    const {x: xt, y: yt} = to,
        {x: xf, y: yf} = from,
        fn: [number, number, number] = [yf - yt, xt - xf, yf * (xt - xf) - xf * (yt - yf)],
        xRangeMin = Math.min(xt, xf),
        xRangeMax = Math.max(xt, xf),
        yRangeMin = Math.min(yt, yf),
        yRangeMax = Math.max(yt, yf)

    const pad = 2;

    const violations = constrains
        .map(line => gaussianElimination(line, fn))
        .filter(p => xRangeMin - pad < p.x && p.x < xRangeMax + pad && yRangeMin - pad < p.y && p.y < yRangeMax + pad)

    if (!violations.length) {
      return to
    }

    const intersection = violations.reduce((p1, p2) => distance(p1, from) < distance(p2, from) ? p1 : p2)
    const padded = {x: intersection.x - from.x, y: intersection.y - from.y},
        padLength = distance(padded, origin)
    return {
      x: intersection.x - padded.x / padLength * 5,
      y: intersection.y - padded.y / padLength * 5
    }
  }

  return clamp
}

/**
 * Resize a vector to given magnitude
 *
 * @param v
 * @param amount
 */
function resizeVector(v: Point, amount: number) {
  const mag = distance(v, origin)
  return {
    x: v.x / mag * amount,
    y: v.y / mag * amount
  }
}

/**
 * Figure out whether the current dragging point
 * is laying on the border of area to live
 */
function convexityPrimer() {
  const currentPoint = modelPainted.value![draggingIndex.value],
      neighbor1 = modelPainted.value![(draggingIndex.value + 1) % modelPainted.value!.length],
      neighbor2 = modelPainted.value![(draggingIndex.value + 3) % modelPainted.value!.length],
      oppositePoint = modelPainted.value![(draggingIndex.value + 2) % modelPainted.value!.length]

  const {x: p, y: q} = neighbor1,
      {x: r, y: s} = neighbor2,
      {x: i, y: j} = currentPoint

  const a = q - s,
      b = r - p,
      c = s * (r - p) - r * (s - q)

  // get the perpendicular vector to the line created by neighbor
  // ax + by = c
  // -bx + ay = aj - bi
  const fn1: [number, number, number] = [a, b, c],
      fn2: [number, number, number] = [-b, a, a * j - i * b],
      res = gaussianElimination(fn1, fn2),
      ppVec = {
        x: res.x - i,
        y: res.y - j
      },
      ppVecResize = resizeVector(ppVec, 55)


  // either add or subtract this vector from original point,
  // the one result in further distance to opposite point
  // is the direction that creates convexity
  const p1 = {
        x: i + ppVec.x,
        y: j + ppVec.y
      },
      p2 = {
        x: i - ppVec.x,
        y: j - ppVec.y
      },
      p1Scaled = {
        x: i + ppVecResize.x,
        y: j + ppVecResize.y
      },
      p2Scaled = {
        x: i - ppVecResize.x,
        y: j - ppVecResize.y
      },
      dist1 = distance(p1, oppositePoint),
      dist2 = distance(p2, oppositePoint)

  // adding the vector = more convexity
  return dist1 > dist2 ? p1Scaled : p2Scaled
}

function dragStart(e: MouseEvent) {
  if (!canvasController.value || !modelPainted.value) {
    return;
  }

  const [x, y] = canvasController.value!.canvasToImage(...canvasController.value!.clientToCanvas(e.clientX, e.clientY))
  modelPainted.value!.forEach((point, i) => {
    const {x: px, y: py} = point
    const dist = Math.sqrt((px - x) ** 2 + (py - y) ** 2)

    // point on the circle
    if (dist < canvasController.value!.pointRadius) {
      draggingIndex.value = i
    }
  })

  if (draggingIndex.value === -1) {
    return
  }
  clamper.value = getAreaToLive()
  const originalPoint = canvasController.value!.coerce(convexityPrimer())
  modelPainted.value[draggingIndex.value] = canvasController.value!.coerce(clamper.value!(originalPoint, modelPainted.value[draggingIndex.value]))
}

function dragEnd() {
  draggingIndex.value = -1
  clamper.value = undefined;
}

function onDrag(e: MouseEvent) {
  if (!canvasController.value || !modelPainted.value || draggingIndex.value === -1) {
    return
  }

  const [x, y] = canvasController.value!.clientToCanvas(e.clientX, e.clientY)
  const newPoint = {x, y}
  const originalPoint = modelPainted.value[draggingIndex.value]

  modelPainted.value[draggingIndex.value] = canvasController.value!.coerce(clamper.value!(originalPoint, newPoint))
}

</script>

<template>
  <div class="wrapper" v-bind="attrs">
    <canvas ref="canvas"
            @mousedown="dragStart"
            @mouseup="dragEnd"
            @mouseleave="dragEnd"
            @mousemove="onDrag"></canvas>
  </div>
</template>

<style scoped>

</style>