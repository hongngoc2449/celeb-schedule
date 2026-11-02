'use client';

import { PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import {
  STACK_BOARD_HEIGHT,
  STACK_BOARD_WIDTH,
  STACK_DROP_COOLDOWN_MS,
  STACK_DROP_LINE_Y,
  STACK_RADII,
  STACK_WARNING_MS,
  StackPiece,
  advanceStack,
  createStackPiece,
  hasDangerPiece,
  randomDropSize,
  readStackSession,
  resetStackSession,
  writeStackSession,
} from '@/lib/stackDropGame';
import { StackScore } from '@/types';

const RING_COLORS = ['#f7b7c6', '#f4a0b5', '#ee7f9a', '#e56b8a', '#d45278', '#b83b62'];
const NAME_STORAGE_KEY = 'osad-stack-player-name';

interface StackDropGameProps {
  title: string;
  hint: string;
  scoreLabel: string;
  closeLabel: string;
  resetLabel: string;
  gameOverLabel: string;
  leaderboardLabel: string;
  namePlaceholder: string;
  emptyBoardLabel: string;
  images: string[];
  onClose: () => void;
}

/**
 * Vẽ một hình tròn đã cắt ảnh vào canvas.
 * @param {CanvasRenderingContext2D} context Ngữ cảnh vẽ.
 * @param {StackPiece} piece Hình cần vẽ.
 * @param {HTMLImageElement[]} images Ảnh theo từng size, có thể chưa tải xong.
 * @param {number} alpha Độ đậm, dùng cho bóng xem trước.
 */
function drawPiece(
  context: CanvasRenderingContext2D,
  piece: StackPiece,
  images: HTMLImageElement[],
  alpha: number
): void {
  const radius = STACK_RADII[piece.sizeIndex];
  const image = images[piece.sizeIndex];
  context.save();
  context.globalAlpha = alpha;
  context.beginPath();
  context.arc(piece.x, piece.y, radius, 0, Math.PI * 2);
  context.clip();
  if (image && image.complete && image.naturalWidth > 0) {
    const scale = Math.max((radius * 2) / image.naturalWidth, (radius * 2) / image.naturalHeight);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    context.drawImage(image, piece.x - width / 2, piece.y - height / 2, width, height);
  } else {
    context.fillStyle = RING_COLORS[piece.sizeIndex];
    context.fillRect(piece.x - radius, piece.y - radius, radius * 2, radius * 2);
  }
  context.restore();
  context.save();
  context.globalAlpha = alpha;
  context.beginPath();
  context.arc(piece.x, piece.y, radius, 0, Math.PI * 2);
  context.strokeStyle = RING_COLORS[piece.sizeIndex];
  context.lineWidth = 3;
  context.stroke();
  context.restore();
}

export default function StackDropGame({
  title,
  hint,
  scoreLabel,
  closeLabel,
  resetLabel,
  gameOverLabel,
  leaderboardLabel,
  namePlaceholder,
  emptyBoardLabel,
  images,
  onClose,
}: StackDropGameProps) {
  const savedSession = readStackSession();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const piecesRef = useRef<StackPiece[]>(savedSession.pieces);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const pointerRef = useRef<{ x: number; y: number; inside: boolean }>({
    x: STACK_BOARD_WIDTH / 2,
    y: 36,
    inside: false,
  });
  const nextIdRef = useRef(savedSession.nextId);
  const nextSizeRef = useRef(randomDropSize());
  const lastDropRef = useRef(0);
  const scoreRef = useRef(savedSession.score);
  const gameOverRef = useRef(savedSession.gameOver);
  const warningStartedAtRef = useRef<number | null>(null);
  const submittedRef = useRef(false);
  const skipInitialSubmitRef = useRef(savedSession.gameOver);
  const playerNameRef = useRef('');
  const [score, setScore] = useState(savedSession.score);
  const [gameOver, setGameOver] = useState(savedSession.gameOver);
  const [warningLeftMs, setWarningLeftMs] = useState(0);
  const [playerName, setPlayerName] = useState('');
  const [leaders, setLeaders] = useState<StackScore[]>([]);
  const [savingScore, setSavingScore] = useState(false);
  const [dropReady, setDropReady] = useState(true);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    try {
      const savedName = window.localStorage.getItem(NAME_STORAGE_KEY) || '';
      setPlayerName(savedName);
      playerNameRef.current = savedName;
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    playerNameRef.current = playerName;
    try {
      window.localStorage.setItem(NAME_STORAGE_KEY, playerName);
    } catch {
      /* ignore */
    }
  }, [playerName]);

  useEffect(() => {
    imagesRef.current = images.map((src) => {
      const image = new Image();
      image.src = src;
      return image;
    });
  }, [images]);

  useEffect(() => {
    let cancelled = false;
    /**
     * Tải top 10 điểm từ server.
     */
    async function loadLeaders() {
      try {
        const response = await fetch('/api/stack-scores');
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled && Array.isArray(data.scores)) {
          setLeaders(data.scores);
        }
      } catch (error) {
        console.error('Load stack scores failed:', error);
      }
    }
    loadLeaders();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!gameOver || submittedRef.current || scoreRef.current < 1) return;
    if (skipInitialSubmitRef.current) {
      skipInitialSubmitRef.current = false;
      submittedRef.current = true;
      return;
    }
    submittedRef.current = true;
    const name = playerNameRef.current.replace(/\s+/g, ' ').trim() || 'Ẩn danh';

    /**
     * Gửi điểm vừa thua lên bảng xếp hạng.
     */
    async function submitScore() {
      setSavingScore(true);
      try {
        const response = await fetch('/api/stack-scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ authorName: name, score: scoreRef.current }),
        });
        if (!response.ok) return;
        const data = await response.json();
        if (Array.isArray(data.scores)) setLeaders(data.scores);
      } catch (error) {
        console.error('Submit stack score failed:', error);
      } finally {
        setSavingScore(false);
      }
    }

    submitScore();
  }, [gameOver]);

  useEffect(() => {
    let frameId = 0;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (!gameOverRef.current) {
        const stepped = advanceStack(piecesRef.current, dt, now);
        piecesRef.current = stepped.pieces;
        if (stepped.gained > 0) {
          scoreRef.current += stepped.gained;
          setScore(scoreRef.current);
        }

        const ready = now - lastDropRef.current >= STACK_DROP_COOLDOWN_MS;
        setDropReady((prev) => (prev === ready ? prev : ready));

        if (hasDangerPiece(piecesRef.current, now)) {
          if (warningStartedAtRef.current === null) {
            warningStartedAtRef.current = now;
          }
          const elapsed = now - warningStartedAtRef.current;
          const left = Math.max(0, STACK_WARNING_MS - elapsed);
          const leftRounded = Math.ceil(left / 100) * 100;
          setWarningLeftMs((prev) => (prev === leftRounded ? prev : leftRounded));
          if (elapsed >= STACK_WARNING_MS) {
            gameOverRef.current = true;
            setGameOver(true);
            setWarningLeftMs(0);
          }
        } else if (warningStartedAtRef.current !== null) {
          warningStartedAtRef.current = null;
          setWarningLeftMs(0);
        }
      }

      writeStackSession(piecesRef.current, scoreRef.current, nextIdRef.current, gameOverRef.current);
      paint(now);
      frameId = window.requestAnimationFrame(loop);
    };

    frameId = window.requestAnimationFrame(loop);
    return () => {
      window.cancelAnimationFrame(frameId);
      writeStackSession(piecesRef.current, scoreRef.current, nextIdRef.current, gameOverRef.current);
    };
  }, []);

  /**
   * Vẽ sân, vùng cảnh báo, hình đã thả và bóng xem trước.
   * @param {number} now Thời gian frame hiện tại.
   */
  function paint(now: number) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    context.clearRect(0, 0, STACK_BOARD_WIDTH, STACK_BOARD_HEIGHT);
    context.fillStyle = '#fff7f4';
    context.fillRect(0, 0, STACK_BOARD_WIDTH, STACK_BOARD_HEIGHT);

    const warningActive = warningStartedAtRef.current !== null && !gameOverRef.current;
    if (warningActive || gameOverRef.current) {
      const pulse = warningActive ? 0.12 + 0.1 * Math.sin(now / 120) : 0.22;
      context.fillStyle = `rgba(220, 40, 70, ${pulse})`;
      context.fillRect(0, 0, STACK_BOARD_WIDTH, STACK_DROP_LINE_Y);
    }

    for (const piece of piecesRef.current) {
      drawPiece(context, piece, imagesRef.current, 1);
    }

    context.save();
    context.beginPath();
    context.moveTo(12, STACK_DROP_LINE_Y);
    context.lineTo(STACK_BOARD_WIDTH - 12, STACK_DROP_LINE_Y);
    context.strokeStyle = warningActive || gameOverRef.current ? '#dc2846' : '#e56b8a';
    context.lineWidth = warningActive ? 3 : 2;
    context.setLineDash([7, 6]);
    context.stroke();
    context.restore();

    if (warningActive && warningStartedAtRef.current !== null) {
      const leftSec = Math.ceil((STACK_WARNING_MS - (now - warningStartedAtRef.current)) / 1000);
      context.save();
      context.fillStyle = '#dc2846';
      context.font = 'bold 28px sans-serif';
      context.textAlign = 'center';
      context.fillText(String(Math.max(1, leftSec)), STACK_BOARD_WIDTH / 2, STACK_DROP_LINE_Y - 18);
      context.restore();
    }

    const pointer = pointerRef.current;
    const readyToDrop = now - lastDropRef.current >= STACK_DROP_COOLDOWN_MS;
    if (!gameOverRef.current && readyToDrop && pointer.inside && pointer.y <= STACK_DROP_LINE_Y) {
      drawPiece(
        context,
        { id: 0, x: pointer.x, y: pointer.y, vx: 0, vy: 0, sizeIndex: nextSizeRef.current, bornAt: 0 },
        imagesRef.current,
        0.45
      );
    }
  }

  /**
   * Đổi tọa độ chuột trên canvas đã co giãn về tọa độ sân chơi.
   * @param {ReactPointerEvent<HTMLCanvasElement>} event Sự kiện chuột hoặc cảm ứng.
   * @returns {{ x: number; y: number }}
   */
  function toBoardPoint(event: ReactPointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) * STACK_BOARD_WIDTH) / rect.width,
      y: ((event.clientY - rect.top) * STACK_BOARD_HEIGHT) / rect.height,
    };
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    const point = toBoardPoint(event);
    pointerRef.current = { ...point, inside: point.y <= STACK_DROP_LINE_Y };
  }

  function handlePointerLeave() {
    pointerRef.current = { ...pointerRef.current, inside: false };
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (gameOverRef.current) return;
    const now = performance.now();
    if (now - lastDropRef.current < STACK_DROP_COOLDOWN_MS) return;
    const point = toBoardPoint(event);
    if (point.y > STACK_DROP_LINE_Y) return;
    const piece = createStackPiece(nextIdRef.current, point.x, point.y, nextSizeRef.current, now);
    nextIdRef.current += 1;
    nextSizeRef.current = randomDropSize();
    lastDropRef.current = now;
    setDropReady(false);
    piecesRef.current = [...piecesRef.current, piece];
  }

  function handleReset() {
    piecesRef.current = [];
    scoreRef.current = 0;
    nextIdRef.current = 1;
    nextSizeRef.current = randomDropSize();
    lastDropRef.current = 0;
    gameOverRef.current = false;
    warningStartedAtRef.current = null;
    submittedRef.current = false;
    resetStackSession();
    setScore(0);
    setGameOver(false);
    setWarningLeftMs(0);
    setDropReady(true);
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#4a2430]/35 px-3 py-4" onClick={onClose}>
      <div
        className="w-full max-w-5xl rounded-3xl border border-[#f3c6d0] bg-[#fffdfb] p-4 shadow-[0_20px_50px_rgba(120,50,70,0.2)] sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative mb-2">
          <h2 className="text-center text-xl font-black text-[#6d2940]">{title}</h2>
          <button type="button" onClick={onClose} className="absolute right-0 top-0 inline-flex items-center rounded-full bg-[#ffe4ea] px-3 py-2 text-sm font-bold text-[#7a3144]">
            <X className="mr-1 h-4 w-4" />
            {closeLabel}
          </button>
        </div>
        <p className="text-center text-4xl font-black leading-none text-[#e56b8a] sm:text-5xl">{score}</p>
        <p className="mb-3 text-center text-sm font-bold text-[#a06b7c]">{scoreLabel}</p>
        <p className="mx-auto mb-3 max-w-xl text-center text-sm font-semibold text-[#8a5364]">{hint}</p>

        <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-start md:justify-center">
          <div className="relative mx-auto w-full max-w-[320px] shrink-0 md:mx-0">
            <canvas
              ref={canvasRef}
              width={STACK_BOARD_WIDTH}
              height={STACK_BOARD_HEIGHT}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              className={`mx-auto block h-auto w-full touch-none rounded-3xl border border-[#f3c6d0] bg-[#fff7f4] ${
                dropReady && !gameOver ? 'cursor-crosshair' : 'cursor-wait'
              }`}
            />
            {gameOver && (
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-[#4a2430]/55 px-4">
                <p className="text-center text-2xl font-black text-white">{gameOverLabel}</p>
                <p className="mt-2 text-center text-lg font-bold text-[#ffe4ea]">
                  {scoreLabel}: {score}
                </p>
                {savingScore && <p className="mt-1 text-sm font-semibold text-[#ffe4ea]">Đang lưu điểm...</p>}
                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-4 rounded-full border border-white/40 bg-white px-4 py-2 text-sm font-bold text-[#7a3144]"
                >
                  {resetLabel}
                </button>
              </div>
            )}
            {!gameOver && warningLeftMs > 0 && (
              <p className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 rounded-full bg-[#dc2846] px-3 py-1 text-sm font-bold text-white">
                {(warningLeftMs / 1000).toFixed(1)}s
              </p>
            )}
          </div>

          <aside className="mx-auto w-full max-w-[320px] rounded-3xl border border-[#f3c6d0] bg-white p-3 md:mx-0 md:max-w-[260px] md:self-stretch">
            <h3 className="mb-2 text-center text-base font-black text-[#6d2940]">{leaderboardLabel}</h3>
            <label className="mb-3 block">
              <span className="sr-only">{namePlaceholder}</span>
              <input
                type="text"
                value={playerName}
                maxLength={24}
                onChange={(event) => setPlayerName(event.target.value)}
                placeholder={namePlaceholder}
                className="w-full rounded-full border border-[#f0c4ce] bg-[#fff7f4] px-3 py-2 text-sm font-semibold text-[#6d2940] outline-none focus:border-[#e56b8a]"
              />
            </label>
            {leaders.length === 0 ? (
              <p className="py-6 text-center text-sm font-semibold text-[#a06b7c]">{emptyBoardLabel}</p>
            ) : (
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#f3c6d0] text-[#a06b7c]">
                    <th className="w-8 py-1 font-bold">#</th>
                    <th className="py-1 font-bold">Tên</th>
                    <th className="py-1 text-right font-bold">{scoreLabel}</th>
                  </tr>
                </thead>
                <tbody>
                  {leaders.map((row, index) => (
                    <tr key={row.id} className="border-b border-[#ffe8ee] last:border-0">
                      <td className="py-2 font-bold text-[#e56b8a]">{index + 1}</td>
                      <td className="max-w-[120px] truncate py-2 font-semibold text-[#6d2940]" title={row.authorName}>
                        {row.authorName}
                      </td>
                      <td className="py-2 text-right font-black text-[#6d2940]">{row.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </aside>
        </div>

        <div className="mt-3 text-center">
          <button type="button" onClick={handleReset} className="rounded-full border border-[#f0c4ce] bg-white px-3 py-2 text-sm font-bold text-[#7a3144]">
            {resetLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
