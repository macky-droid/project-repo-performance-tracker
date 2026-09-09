// COCO 80 dataset classes for RF-DETR and Supervision
export const COCO_CLASSES: Record<number, string> = {
  0: "person",
  1: "bicycle",
  2: "car",
  3: "motorcycle",
  4: "airplane",
  5: "bus",
  6: "train",
  7: "truck",
  8: "boat",
  9: "traffic light",
  10: "fire hydrant",
  11: "stop sign",
  12: "parking meter",
  13: "bench",
  14: "bird",
  15: "cat",
  16: "dog",
  17: "horse",
  18: "sheep",
  19: "cow",
  20: "elephant",
  21: "bear",
  22: "zebra",
  23: "giraffe",
  24: "backpack",
  25: "umbrella",
  26: "handbag",
  27: "tie",
  28: "suitcase",
  29: "frisbee",
  30: "skis",
  31: "snowboard",
  32: "sports ball",
  33: "kite",
  34: "baseball bat",
  35: "baseball glove",
  36: "skateboard",
  37: "surfboard",
  38: "tennis racket",
  39: "bottle",
  40: "wine glass",
  41: "cup",
  42: "fork",
  43: "knife",
  44: "spoon",
  45: "bowl",
  46: "banana",
  47: "apple",
  48: "sandwich",
  49: "orange",
  50: "broccoli",
  51: "carrot",
  52: "hot dog",
  53: "pizza",
  54: "donut",
  55: "cake",
  56: "chair",
  57: "couch",
  58: "potted plant",
  59: "bed",
  60: "dining table",
  61: "toilet",
  62: "tv",
  63: "laptop",
  64: "mouse",
  65: "remote",
  66: "keyboard",
  67: "cell phone",
  68: "microwave",
  69: "oven",
  70: "toaster",
  71: "sink",
  72: "refrigerator",
  73: "book",
  74: "clock",
  75: "vase",
  76: "scissors",
  77: "teddy bear",
  78: "hair drier",
  79: "toothbrush"
};

// Reverse lookup: label -> class_id
export const COCO_LABEL_TO_ID: Record<string, number> = Object.entries(COCO_CLASSES).reduce(
  (acc, [idStr, label]) => {
    acc[label.toLowerCase()] = Number(idStr);
    return acc;
  },
  {} as Record<string, number>
);

// Supervision default color palette generator (sv.ColorPalette.DEFAULT)
export const SUPERVISION_COLORS = [
  "#A351FB", // Purple
  "#FF4040", // Red
  "#FFAA1D", // Orange
  "#FFF000", // Yellow
  "#58D68D", // Green
  "#3498DB", // Blue
  "#E74C3C", // Coral
  "#1ABC9C", // Turquoise
  "#9B59B6", // Violet
  "#F39C12", // Gold
  "#00E676", // Neon Green
  "#00B0FF"  // Sky Blue
];

export function getSupervisionColor(classId: number): string {
  return SUPERVISION_COLORS[classId % SUPERVISION_COLORS.length];
}

export interface RFDetrDetection {
  class_id: number;
  class_name: string;
  confidence: number;
  xyxy: [number, number, number, number]; // [xmin, ymin, xmax, ymax] in normalized 0-1000 or absolute pixels
  box_2d?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] normalized 0-1000
}
