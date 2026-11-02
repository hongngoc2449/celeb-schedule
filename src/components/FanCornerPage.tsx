'use client';

import { FormEvent, PointerEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CircleDot, Heart, ImagePlus, PenLine, Send, Trash2, Upload } from 'lucide-react';
import StackDropGame from '@/components/StackDropGame';
import { FanMessage } from '@/types';
import { getSiteText } from '@/lib/siteTexts';

type SignatureMode = 'draw' | 'upload';
type NoticeTone = 'success' | 'error' | 'pending';

interface FanCornerPageProps {
  messages: FanMessage[];
  canDelete: boolean;
  siteTexts?: Record<string, string>;
  stackImages: string[];
}

/**
 * Lấy tọa độ bút trên canvas, đã nhân theo tỉ lệ hiển thị.
 * @param {PointerEvent<HTMLCanvasElement>} event Sự kiện chuột hoặc cảm ứng.
 * @param {HTMLCanvasElement} canvas Canvas chữ ký.
 * @returns {{ x: number; y: number }} Điểm vẽ.
 */
function getCanvasPoint(event: PointerEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height),
  };
}

/**
 * Xuất canvas chữ ký thành file PNG. Bỏ qua nếu người dùng chưa ký.
 * @param {HTMLCanvasElement | null} canvas Canvas hiện tại.
 * @param {boolean} hasInk Đã có nét vẽ hay chưa.
 * @returns {Promise<File | null>}
 */
function exportSignatureFile(canvas: HTMLCanvasElement | null, hasInk: boolean): Promise<File | null> {
  if (!canvas || !hasInk) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Không xuất được chữ ký'));
        return;
      }
      resolve(new File([blob], 'signature.png', { type: 'image/png' }));
    }, 'image/png');
  });
}

export default function FanCornerPage({ messages, canDelete, siteTexts, stackImages }: FanCornerPageProps) {
  const router = useRouter();
  const t = (id: string) => getSiteText(siteTexts, id);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const hasInkRef = useRef(false);
  const photoUrlRef = useRef('');

  const [items, setItems] = useState(messages);
  const [authorName, setAuthorName] = useState('');
  const [text, setText] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [signatureMode, setSignatureMode] = useState<SignatureMode>('draw');
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [gameOpen, setGameOpen] = useState(false);
  const closeGame = useCallback(() => setGameOpen(false), []);
  const [notice, setNotice] = useState<{ tone: NoticeTone; message: string } | null>(null);

  useEffect(() => {
    setItems(messages);
  }, [messages]);

  useEffect(() => {
    return () => {
      if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    };
  }, []);

  /**
   * Xóa nét vẽ trên canvas.
   */
  function clearCanvas() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    hasInkRef.current = false;
  }

  function handlePointerDown(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const point = getCanvasPoint(event, canvas);
    drawingRef.current = true;
    canvas.setPointerCapture(event.pointerId);
    context.strokeStyle = '#141414';
    context.lineWidth = 3;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.beginPath();
    context.moveTo(point.x, point.y);
  }

  function handlePointerMove(event: PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const point = getCanvasPoint(event, canvas);
    context.lineTo(point.x, point.y);
    context.stroke();
    hasInkRef.current = true;
  }

  function handlePointerUp() {
    drawingRef.current = false;
  }

  function handlePhotoChange(file: File | null) {
    if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    photoUrlRef.current = file ? URL.createObjectURL(file) : '';
    setPhoto(file);
    setPhotoPreview(photoUrlRef.current);
  }

  function handleSignatureFile(file: File | null) {
    if (signaturePreview) URL.revokeObjectURL(signaturePreview);
    const nextPreview = file ? URL.createObjectURL(file) : '';
    setSignatureFile(file);
    setSignaturePreview(nextPreview);
  }

  function resetForm() {
    setAuthorName('');
    setText('');
    handlePhotoChange(null);
    handleSignatureFile(null);
    clearCanvas();
    setSignatureMode('draw');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);

    const trimmedName = authorName.replace(/\s+/g, ' ').trim();
    const trimmedText = text.trim();
    if (!trimmedName || !trimmedText) {
      setNotice({ tone: 'error', message: t('corner_required_notice') });
      return;
    }

    setSubmitting(true);
    setNotice({ tone: 'pending', message: t('corner_sending_notice') });

    try {
      const formData = new FormData();
      formData.append('authorName', trimmedName);
      formData.append('text', trimmedText);
      if (photo) formData.append('photo', photo);

      if (signatureMode === 'draw') {
        const drawn = await exportSignatureFile(canvasRef.current, hasInkRef.current);
        if (drawn) formData.append('signature', drawn);
      } else if (signatureFile) {
        formData.append('signature', signatureFile);
      }

      const response = await fetch('/api/messages', { method: 'POST', body: formData });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || t('corner_send_error'));
      }

      resetForm();
      setFormOpen(false);
      setNotice({ tone: 'success', message: t('corner_sent_notice') });
      router.refresh();
    } catch (error) {
      console.error('Submit fan message failed:', error);
      setNotice({
        tone: 'error',
        message: error instanceof Error ? error.message : t('corner_send_error'),
      });
    } finally {
      setSubmitting(false);
    }
  }

  /**
   * Mở popup xác nhận trước khi xóa card.
   * @param {string} id Id lời nhắn.
   */
  function askDelete(id: string) {
    setDeleteTargetId(id);
  }

  /**
   * Đóng popup xác nhận xóa.
   */
  function cancelDelete() {
    if (deletingId) return;
    setDeleteTargetId(null);
  }

  /**
   * Xóa lời nhắn sau khi admin bấm xác nhận trên popup.
   */
  async function confirmDelete() {
    if (!deleteTargetId) return;
    const id = deleteTargetId;
    setDeletingId(id);
    try {
      const response = await fetch(`/api/messages/${id}`, { method: 'DELETE' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || t('corner_delete_error'));
      setItems((current) => current.filter((item) => item.id !== id));
      setDeleteTargetId(null);
      router.refresh();
    } catch (error) {
      console.error('Delete fan message failed:', error);
      setNotice({
        tone: 'error',
        message: error instanceof Error ? error.message : t('corner_delete_error'),
      });
    } finally {
      setDeletingId('');
    }
  }

  const noticeClass =
    notice?.tone === 'success'
      ? 'bg-brand-lightgreen text-brand-green'
      : notice?.tone === 'pending'
        ? 'bg-orange-100 text-orange-700'
        : 'bg-red-100 text-brand-red';

  const softField = 'mt-1 w-full rounded-2xl border border-[#f0c4ce] bg-white px-3 py-2 text-sm font-semibold text-[#4a2430] outline-none focus:border-[#e58aa0]';
  const softButton = 'inline-flex items-center rounded-full border border-[#f0c4ce] bg-white px-3 py-2 text-sm font-bold text-[#7a3144]';

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black font-cocogoose tracking-tight text-[#6d2940]">{t('corner_title')}</h1>
          <p className="mt-2 text-sm sm:text-base font-semibold text-[#8a5364] max-w-2xl">
            {t('corner_subtitle')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 self-start">
          <button
            type="button"
            onClick={() => setGameOpen(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#f0c4ce] bg-white px-4 py-2 text-sm font-bold text-[#7a3144]"
          >
            <CircleDot className="w-4 h-4 text-[#e56b8a]" />
            {t('corner_game_button')}
          </button>
          <button
            type="button"
            onClick={() => setFormOpen((open) => !open)}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#e56b8a] px-4 py-2 text-sm font-bold text-white shadow-[0_8px_20px_rgba(229,107,138,0.28)]"
          >
            <Heart className="w-4 h-4" />
            {formOpen ? t('corner_close_form') : t('corner_open_form')}
          </button>
        </div>
      </div>

      {notice && (
        <p className={`mb-4 rounded-2xl px-3 py-2 text-sm font-bold ${noticeClass}`}>
          {notice.message}
        </p>
      )}

      {formOpen && (
      <form onSubmit={handleSubmit} className="mb-8 rounded-3xl border border-[#f3c6d0] bg-[#fffdfb]/90 p-4 shadow-[0_16px_40px_rgba(180,90,120,0.12)] sm:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-bold text-[#6d2940]">
            {t('corner_name_label')}
            <input
              value={authorName}
              onChange={(event) => setAuthorName(event.target.value)}
              maxLength={40}
              required
              className={softField}
              placeholder={t('corner_name_placeholder')}
            />
          </label>
          <div className="text-sm font-bold text-[#6d2940]">
            {t('corner_photo_label')}
            <label className={`${softButton} mt-1 w-full cursor-pointer justify-center`}>
              <ImagePlus className="w-4 h-4" />
              <span className="ml-2">{photo ? photo.name : t('corner_photo_button')}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={(event) => handlePhotoChange(event.target.files?.[0] || null)}
              />
            </label>
          </div>
        </div>

        {photoPreview && (
          <img src={photoPreview} alt="Xem trước ảnh" className="mt-4 max-h-56 rounded-2xl border border-[#f3c6d0] object-contain" />
        )}

        <label className="mt-4 block text-sm font-bold text-[#6d2940]">
          {t('corner_text_label')}
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={800}
            required
            rows={4}
            className={softField}
            placeholder={t('corner_text_placeholder')}
          />
        </label>
        <p className="mt-1 text-sm font-semibold text-[#a06b7c]">{text.trim().length}/800</p>

        <div className="mt-4">
          <p className="text-sm font-bold text-[#6d2940]">{t('corner_signature_label')}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSignatureMode('draw')}
              className={`${softButton} ${signatureMode === 'draw' ? 'bg-[#ffe4ea]' : ''}`}
            >
              <PenLine className="w-4 h-4" />
              <span className="ml-2">{t('corner_signature_draw')}</span>
            </button>
            <button
              type="button"
              onClick={() => setSignatureMode('upload')}
              className={`${softButton} ${signatureMode === 'upload' ? 'bg-[#ffe4ea]' : ''}`}
            >
              <Upload className="w-4 h-4" />
              <span className="ml-2">{t('corner_signature_upload')}</span>
            </button>
          </div>

          {signatureMode === 'draw' ? (
            <div className="mt-3">
              <canvas
                ref={canvasRef}
                width={640}
                height={200}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                className="h-40 w-full cursor-crosshair touch-none rounded-2xl border border-[#f3c6d0] bg-[#fffaf8]"
              />
              <button type="button" onClick={clearCanvas} className={`${softButton} mt-2`}>
                {t('corner_signature_clear')}
              </button>
            </div>
          ) : (
            <div className="mt-3">
              <label className={`${softButton} cursor-pointer`}>
                <Upload className="w-4 h-4" />
                <span className="ml-2">{signatureFile ? signatureFile.name : t('corner_signature_file')}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  onChange={(event) => handleSignatureFile(event.target.files?.[0] || null)}
                />
              </label>
              {signaturePreview && (
                <img src={signaturePreview} alt="Xem trước chữ ký" className="mt-3 max-h-28 rounded-2xl border border-[#f3c6d0] bg-white object-contain" />
              )}
            </div>
          )}
        </div>

        <button type="submit" disabled={submitting} className="mt-4 inline-flex items-center rounded-full bg-[#e56b8a] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
          <Send className="w-4 h-4" />
          <span className="ml-2">{submitting ? t('corner_submitting') : t('corner_submit')}</span>
        </button>
      </form>
      )}

      {items.length === 0 ? (
        <div className="rounded-3xl border border-[#f3c6d0] bg-[#fffdfb]/80 p-6 text-sm font-semibold text-[#8a5364] shadow-[0_12px_30px_rgba(180,90,120,0.08)]">
          {t('corner_empty')}
        </div>
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 xl:columns-3">
          {items.map((message) => (
            <article key={message.id} className="mb-4 flex w-full break-inside-avoid flex-col rounded-3xl border border-[#f3c6d0] bg-[#fffdfb]/90 p-4 shadow-[0_14px_34px_rgba(180,90,120,0.12)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-black text-[#6d2940]">{message.authorName}</h2>
                  <p className="text-sm font-semibold text-[#a06b7c]">
                    {new Date(message.createdAt).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
                <Heart className="h-5 w-5 shrink-0 fill-[#f7b7c6] text-[#e56b8a]" />
              </div>
              {message.imageUrl && (
                <img src={message.imageUrl} alt="" className="mt-3 h-auto w-full rounded-2xl object-contain" />
              )}
              <p className="mt-3 whitespace-pre-wrap break-words text-sm font-semibold text-[#4a2430]">{message.text}</p>
              {message.signatureUrl && (
                <img src={message.signatureUrl} alt={`Chữ ký của ${message.authorName}`} className="mt-3 max-h-20 w-full rounded-2xl bg-[#fff5f2] object-contain" />
              )}
              {canDelete && (
                <button
                  type="button"
                  onClick={() => askDelete(message.id)}
                  disabled={deletingId === message.id}
                  className="mt-4 inline-flex items-center self-start rounded-full bg-[#e56b8a] px-3 py-2 text-sm font-bold text-white disabled:opacity-60"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="ml-2">{deletingId === message.id ? t('corner_deleting') : t('corner_delete')}</span>
                </button>
              )}
            </article>
          ))}
        </div>
      )}
      {deleteTargetId && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#4a2430]/40 px-4"
          onClick={cancelDelete}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-[#f3c6d0] bg-[#fffdfb] p-5 shadow-[0_20px_50px_rgba(120,50,70,0.22)]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="fan-delete-title"
          >
            <h2 id="fan-delete-title" className="text-center text-lg font-black text-[#6d2940]">
              {t('corner_delete_confirm_title')}
            </h2>
            <p className="mt-3 text-center text-sm font-semibold text-[#8a5364]">{t('corner_delete_confirm')}</p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={cancelDelete}
                disabled={Boolean(deletingId)}
                className="rounded-full border border-[#f0c4ce] bg-white px-4 py-2 text-sm font-bold text-[#7a3144] disabled:opacity-60"
              >
                {t('corner_delete_cancel')}
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={Boolean(deletingId)}
                className="rounded-full bg-[#e56b8a] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
              >
                {deletingId ? t('corner_deleting') : t('corner_delete')}
              </button>
            </div>
          </div>
        </div>
      )}
      {gameOpen && (
        <StackDropGame
          title={t('corner_game_title')}
          hint={t('corner_game_hint')}
          scoreLabel={t('corner_game_score')}
          closeLabel={t('corner_game_close')}
          resetLabel={t('corner_game_reset')}
          gameOverLabel={t('corner_game_over')}
          leaderboardLabel={t('corner_game_leaderboard')}
          namePlaceholder={t('corner_game_name')}
          emptyBoardLabel={t('corner_game_empty_board')}
          images={stackImages}
          onClose={closeGame}
        />
      )}
    </section>
  );
}
