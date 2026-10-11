export type CategoryId = "desk" | "chair" | "screen" | "accessory" | "extra";

export type SlotId =
  | "desk"
  | "chair"
  | "monitor"
  | "monitorStand"
  | "lightBar"
  | "deskLamp"
  | "ambientLamp"
  | "keyboard"
  | "mouse"
  | "mousePad"
  | "laptopStand"
  | "webcam"
  | "headphones"
  | "mic"
  | "computer"
  | "dock"
  | "power"
  | "cable"
  | "plant"
  | "internet"
  | "dehumidifier"
  | "purifier"
  | "fan"
  | "coffee"
  | "underDesk";

export type Plan = "weekly" | "monthly";
export type Posture = "sit" | "stand";
export type Tone = "dark" | "silver";

// Which scene component draws an item, with its visual parameters.
export type ArtSpec =
  | { kind: "desk"; variant: "electric" | "mechanical" | "dualMotor" }
  | { kind: "chair"; variant: "ergo" | "basic" | "premium" }
  | { kind: "monitor"; inches: number; ultrawide: boolean; tone: Tone }
  | { kind: "keyboard"; tone: Tone }
  | { kind: "mouse"; tone: Tone }
  | { kind: "plant"; variant: "monstera" | "snake" }
  | {
      kind:
        | "deskLamp"
        | "hueLamp"
        | "lightBar"
        | "mousePad"
        | "laptopStand"
        | "monitorStand"
        | "webcam"
        | "headphones"
        | "mic"
        | "macMini"
        | "dock"
        | "powerStrip"
        | "cable"
        | "starlink"
        | "router"
        | "dehumidifier"
        | "purifier"
        | "fan"
        | "coffee"
        | "walkingPad";
    };

export interface CatalogItem {
  id: string;
  slug?: string;
  name: string;
  category: CategoryId;
  group?: string;
  slot: SlotId;
  slotSize: number;
  maxQty: number;
  requires?: SlotId;
  weeklyCents: number;
  monthlyCents: number;
  salePercent: number;
  instant: boolean;
  concept: boolean;
  imageUrl?: string;
  benefit: string;
  widthCm?: number;
  art: ArtSpec;
  tags: string[];
}

export interface Setup {
  deskId: string;
  chairId: string | null;
  items: Record<string, number>;
  plan: Plan;
  posture: Posture;
}

export type PresetId = "essentials" | "founders" | "trading" | "studio";

export interface Preset {
  id: PresetId;
  name: string;
  tagline: string;
  setup: Setup;
}

export interface SetupLine {
  item: CatalogItem;
  qty: number;
}

// Toast buttons: switch to a wider desk (then retry the item), or undo the last change.
export type NoticeAction =
  | { kind: "upgradeDesk"; label: string; deskId: string; addItemId?: string }
  | { kind: "undo"; label: string };

export interface Notice {
  message: string;
  action?: NoticeAction;
}

export type Arrival = "today" | "tomorrow";
