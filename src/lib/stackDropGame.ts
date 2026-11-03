export const STACK_BOARD_WIDTH = 320;
export const STACK_BOARD_HEIGHT = 400;
export const STACK_DROP_LINE_Y = 72;
export const STACK_SIZE_COUNT = 10;
/** Size 1→10; size 10 = radius size 6 cũ (80), khoảng cách giữa các size đều hơn. */
export const STACK_RADII = [18, 25, 32, 39, 46, 53, 60, 67, 73, 80];
export const STACK_WARNING_MS = 2500;
export const STACK_SETTLED_SPEED = 55;
export const STACK_IMAGES = [
  '/images/logo%203.png',
  '/images/avt-opt.png',
  '/images/Asset%201.png',
  '/images/Asset%204.png',
  '/images/logo%202.png',
  '/images/oxad-omai.jpg',
  '/images/logo%203.png',
  '/images/avt-opt.png',
  '/images/Asset%201.png',
  '/images/Asset%204.png',
];

/**
 * Lấy đúng 10 ảnh hình tròn. Ô admin để trống thì dùng ảnh mặc định của size đó.
 * @param {string[] | undefined} custom Ảnh admin đã lưu, theo thứ tự size nhỏ đến lớn.
 * @returns {string[]} Đúng 10 đường dẫn.
 */
export function resolveStackImages(custom?: string[]): string[] {
  return Array.from({ length: STACK_SIZE_COUNT }, (_, index) => {
    const value = custom?.[index];
    const fallback = STACK_IMAGES[index] || STACK_IMAGES[index % STACK_IMAGES.length];
    return value && value.trim() ? value.trim() : fallback;
  });
}

const GRAVITY = 3400;
const RESTITUTION = 0.32;
const MERGE_DELAY_MS = 220;
const DANGER_GRACE_MS = 450;

export interface StackPiece {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  sizeIndex: number;
  bornAt: number;
}

/**
 * Điểm khi ghép hai hình cùng size. Size nhỏ nhất được 1 điểm, mỗi size sau thêm 1.
 * @param {number} sizeIndex Size đang ghép, 0 là nhỏ nhất.
 * @returns {number} Điểm cộng thêm.
 */
export function scoreForMerge(sizeIndex: number): number {
  return sizeIndex + 1;
}

/**
 * Random size thả xuống: 1, 2 hoặc 3 (index 0–2).
 * @returns {number} SizeIndex.
 */
export function randomDropSize(): number {
  return Math.floor(Math.random() * 3);
}

/**
 * Tung độ thả: luôn nằm phía trên vạch đỏ, đáy hình gần sát vạch.
 * @param {number} sizeIndex Size sắp thả.
 * @returns {number}
 */
export function dropYForSize(sizeIndex: number): number {
  const radius = STACK_RADII[sizeIndex];
  return Math.max(radius, STACK_DROP_LINE_Y - radius - 2);
}

/**
 * Tạo hình mới. Y luôn dóng phía trên vạch đỏ; X theo chỗ bấm (đã kẹp trong sân).
 * @param {number} id Id duy nhất trong ván.
 * @param {number} x Hoành độ chỗ bấm.
 * @param {number} _y Bỏ qua — luôn thả trên vạch.
 * @param {number} sizeIndex Size bắt đầu, thường là 0.
 * @param {number} now Mốc thời gian để chưa ghép ngay lúc vừa thả.
 * @returns {StackPiece}
 */
export function createStackPiece(id: number, x: number, _y: number, sizeIndex: number, now: number): StackPiece {
  const radius = STACK_RADII[sizeIndex];
  return {
    id,
    x: clamp(x, radius, STACK_BOARD_WIDTH - radius),
    y: dropYForSize(sizeIndex),
    vx: 0,
    vy: 80,
    sizeIndex,
    bornAt: now,
  };
}

/**
 * Hình đã ổn định mà đỉnh còn vượt vạch thả → nằm trong vùng nguy hiểm.
 * @param {StackPiece[]} pieces Các hình trên sân.
 * @param {number} now Thời gian hiện tại.
 * @returns {boolean}
 */
export function hasDangerPiece(pieces: StackPiece[], now: number): boolean {
  return pieces.some((piece) => {
    if (now - piece.bornAt < DANGER_GRACE_MS) return false;
    const top = piece.y - STACK_RADII[piece.sizeIndex];
    if (top >= STACK_DROP_LINE_Y) return false;
    return Math.hypot(piece.vx, piece.vy) < STACK_SETTLED_SPEED;
  });
}

/** Khoảng cách tối thiểu giữa hai lần thả (ms). */
export const STACK_DROP_COOLDOWN_MS = 900;

/**
 * Một bước vật lý rồi ghép các cặp cùng size đang chạm nhau.
 * @param {StackPiece[]} pieces Danh sách hiện tại, không bị sửa tại chỗ.
 * @param {number} dt Giây trôi qua từ frame trước.
 * @param {number} now Thời gian hiện tại, mili giây.
 * @returns {{ pieces: StackPiece[]; gained: number }} Bàn mới và điểm vừa kiếm.
 */
export function advanceStack(pieces: StackPiece[], dt: number, now: number): { pieces: StackPiece[]; gained: number } {
  const step = clamp(dt, 0, 0.033);
  const next = pieces.map((piece) => ({ ...piece }));

  for (const piece of next) {
    piece.vy += GRAVITY * step;
    piece.x += piece.vx * step;
    piece.y += piece.vy * step;
    piece.vx *= 0.992;
  }

  for (let iteration = 0; iteration < 8; iteration += 1) {
    for (const piece of next) containInBoard(piece);
    for (let left = 0; left < next.length; left += 1) {
      for (let right = left + 1; right < next.length; right += 1) {
        resolveContact(next[left], next[right]);
      }
    }
  }

  const { pieces: merged, gained } = mergeTouchingPairs(next, now);
  return { pieces: merged, gained };
}

/**
 * Ghép lần lượt các cặp cùng size. Size cuối cùng thì cả hai biến mất.
 * @param {StackPiece[]} pieces Các hình sau khi đã va chạm.
 * @param {number} now Thời gian hiện tại.
 * @returns {{ pieces: StackPiece[]; gained: number }}
 */
function mergeTouchingPairs(pieces: StackPiece[], now: number): { pieces: StackPiece[]; gained: number } {
  let pool = pieces;
  let gained = 0;

  for (let round = 0; round < STACK_SIZE_COUNT; round += 1) {
    const used = new Set<number>();
    const created: StackPiece[] = [];
    let mergedThisRound = false;

    for (let left = 0; left < pool.length; left += 1) {
      if (used.has(pool[left].id)) continue;
      for (let right = left + 1; right < pool.length; right += 1) {
        if (used.has(pool[right].id)) continue;
        const pair = pool[left];
        const other = pool[right];
        if (!canMerge(pair, other, now)) continue;
        used.add(pair.id);
        used.add(other.id);
        gained += scoreForMerge(pair.sizeIndex);
        mergedThisRound = true;
        if (pair.sizeIndex < STACK_SIZE_COUNT - 1) {
          created.push({
            id: pair.id,
            x: (pair.x + other.x) / 2,
            y: (pair.y + other.y) / 2,
            vx: (pair.vx + other.vx) / 2,
            vy: (pair.vy + other.vy) / 2,
            sizeIndex: pair.sizeIndex + 1,
            bornAt: now - MERGE_DELAY_MS,
          });
          containInBoard(created[created.length - 1]);
        }
        break;
      }
    }

    if (!mergedThisRound) break;
    pool = pool.filter((piece) => !used.has(piece.id)).concat(created);
  }

  return { pieces: pool, gained };
}

/**
 * Hai hình ghép được khi cùng size, đã rơi khỏi tay một nhịp, và đang chạm.
 * @param {StackPiece} left Hình thứ nhất.
 * @param {StackPiece} right Hình thứ hai.
 * @param {number} now Thời gian hiện tại.
 * @returns {boolean}
 */
function canMerge(left: StackPiece, right: StackPiece, now: number): boolean {
  if (left.sizeIndex !== right.sizeIndex) return false;
  if (now - left.bornAt < MERGE_DELAY_MS || now - right.bornAt < MERGE_DELAY_MS) return false;
  const reach = STACK_RADII[left.sizeIndex] + STACK_RADII[right.sizeIndex];
  return Math.hypot(right.x - left.x, right.y - left.y) <= reach + 0.5;
}

/**
 * Đẩy hai hình ra khỏi nhau và đổi vận tốc theo hướng va chạm.
 * @param {StackPiece} left Hình thứ nhất.
 * @param {StackPiece} right Hình thứ hai.
 */
function resolveContact(left: StackPiece, right: StackPiece): void {
  const reach = STACK_RADII[left.sizeIndex] + STACK_RADII[right.sizeIndex];
  let dx = right.x - left.x;
  let dy = right.y - left.y;
  let distance = Math.hypot(dx, dy);
  if (distance >= reach) return;
  if (distance < 0.001) {
    dx = 0.01;
    dy = 0;
    distance = 0.01;
  }
  const normalX = dx / distance;
  const normalY = dy / distance;
  const overlap = reach - distance;
  left.x -= normalX * overlap * 0.5;
  left.y -= normalY * overlap * 0.5;
  right.x += normalX * overlap * 0.5;
  right.y += normalY * overlap * 0.5;

  const approach = (right.vx - left.vx) * normalX + (right.vy - left.vy) * normalY;
  if (approach > 0) return;
  const impulse = -(1 + RESTITUTION) * approach * 0.5;
  left.vx -= impulse * normalX;
  left.vy -= impulse * normalY;
  right.vx += impulse * normalX;
  right.vy += impulse * normalY;
  left.vx *= 0.97;
  right.vx *= 0.97;
}

/**
 * Giữ hình bên trong sân.
 * @param {StackPiece} piece Hình cần kẹp.
 */
function containInBoard(piece: StackPiece): void {
  const radius = STACK_RADII[piece.sizeIndex];
  if (piece.x < radius) {
    piece.x = radius;
    piece.vx = Math.abs(piece.vx) * RESTITUTION;
  } else if (piece.x > STACK_BOARD_WIDTH - radius) {
    piece.x = STACK_BOARD_WIDTH - radius;
    piece.vx = -Math.abs(piece.vx) * RESTITUTION;
  }
  if (piece.y < radius) {
    piece.y = radius;
    piece.vy = Math.abs(piece.vy) * RESTITUTION;
  } else if (piece.y > STACK_BOARD_HEIGHT - radius - 4) {
    piece.y = STACK_BOARD_HEIGHT - radius - 4;
    piece.vy = -Math.abs(piece.vy) * RESTITUTION;
    piece.vx *= 0.88;
  }
}

/**
 * Kẹp một số vào khoảng cho trước.
 * @param {number} value Giá trị.
 * @param {number} min Cận dưới.
 * @param {number} max Cận trên.
 * @returns {number}
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export interface StackGameSession {
  pieces: StackPiece[];
  score: number;
  nextId: number;
  gameOver: boolean;
}

const stackGameSession: StackGameSession = {
  pieces: [],
  score: 0,
  nextId: 1,
  gameOver: false,
};

/**
 * Bản chơi đang giữ trong bộ nhớ. Tải lại trang thì mất.
 * @returns {StackGameSession}
 */
export function readStackSession(): StackGameSession {
  return {
    pieces: stackGameSession.pieces.map((piece) => ({ ...piece })),
    score: stackGameSession.score,
    nextId: stackGameSession.nextId,
    gameOver: stackGameSession.gameOver,
  };
}

/**
 * Ghi lại hình và điểm để mở popup lần sau vẫn còn.
 * @param {StackPiece[]} pieces Các hình trên sân.
 * @param {number} score Điểm hiện tại.
 * @param {number} nextId Id kế tiếp cho hình mới.
 * @param {boolean} gameOver Đã thua hay chưa.
 */
export function writeStackSession(
  pieces: StackPiece[],
  score: number,
  nextId: number,
  gameOver: boolean
): void {
  stackGameSession.pieces = pieces.map((piece) => ({ ...piece }));
  stackGameSession.score = score;
  stackGameSession.nextId = nextId;
  stackGameSession.gameOver = gameOver;
}

/**
 * Xóa ván chơi trong bộ nhớ khi bấm chơi lại.
 */
export function resetStackSession(): void {
  stackGameSession.pieces = [];
  stackGameSession.score = 0;
  stackGameSession.nextId = 1;
  stackGameSession.gameOver = false;
}
