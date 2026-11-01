'use client';

import { useState, useMemo } from 'react';
import { SITE_TEXT_DEFINITIONS } from '@/lib/siteTexts';
import {
  Search,
  RotateCcw,
  Save,
  Check,
  FileSpreadsheet,
  Filter,
  Sparkles,
  Info,
  Undo2
} from 'lucide-react';

interface Props {
  initialSiteTexts?: Record<string, string>;
  onSave: (updatedTexts: Record<string, string>) => Promise<boolean>;
  saving: boolean;
}

export default function SiteTextsExcelTable({
  initialSiteTexts = {},
  onSave,
  saving,
}: Props) {
  const [siteTexts, setSiteTexts] = useState<Record<string, string>>(initialSiteTexts);
  const [search, setSearch] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('ALL');
  const [activeCellId, setActiveCellId] = useState<string | null>(null);

  // Unique sections
  const sections = useMemo(() => {
    const list = Array.from(new Set(SITE_TEXT_DEFINITIONS.map((item) => item.section)));
    return ['ALL', ...list];
  }, []);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return SITE_TEXT_DEFINITIONS.filter((item) => {
      if (selectedSection !== 'ALL' && item.section !== selectedSection) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const currentVal = (siteTexts[item.id] ?? item.defaultValue).toLowerCase();
        const defaultVal = item.defaultValue.toLowerCase();
        const loc = item.location.toLowerCase();
        const sec = item.section.toLowerCase();
        if (
          !currentVal.includes(q) &&
          !defaultVal.includes(q) &&
          !loc.includes(q) &&
          !sec.includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [selectedSection, search, siteTexts]);

  // Count modified items
  const modifiedCount = useMemo(() => {
    return SITE_TEXT_DEFINITIONS.filter((item) => {
      const current = siteTexts[item.id];
      return current !== undefined && current !== item.defaultValue;
    }).length;
  }, [siteTexts]);

  // Handle cell change
  const handleCellChange = (id: string, value: string) => {
    setSiteTexts((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Reset single row to default
  const handleResetRow = (id: string, defaultVal: string) => {
    setSiteTexts((prev) => {
      const copy = { ...prev };
      copy[id] = defaultVal;
      return copy;
    });
  };

  // Reset all to defaults
  const handleResetAll = () => {
    if (!confirm('Bạn có chắc muốn khôi phục toàn bộ các text về giá trị ban đầu?')) {
      return;
    }
    const defaults: Record<string, string> = {};
    SITE_TEXT_DEFINITIONS.forEach((item) => {
      defaults[item.id] = item.defaultValue;
    });
    setSiteTexts(defaults);
  };

  const handleSaveAll = async () => {
    await onSave(siteTexts);
  };

  return (
    <div className="neo-box bg-white border-3 border-black shadow-brutal-xl overflow-hidden mt-8">
      {/* EXCEL TOP TITLE & TOOLBAR */}
      <div className="bg-[#107c41] text-white p-4 sm:p-5 border-b-3 border-black flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white text-[#107c41] rounded-xl border-2 border-black flex items-center justify-center font-black shadow-brutal-xs">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-emerald-950 text-emerald-200 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider border border-emerald-700">
                EXCEL SHEET EDITOR
              </span>
              {modifiedCount > 0 && (
                <span className="text-[10px] bg-brand-yellow text-black px-2 py-0.5 rounded font-black border border-black animate-pulse">
                  {modifiedCount} ô đã sửa
                </span>
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase font-cocogoose tracking-tight mt-0.5">
              Bảng Tổng Hợp &amp; Tùy Biến Toàn Bộ Text Website
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <button
            type="button"
            onClick={handleResetAll}
            className="neo-btn bg-white hover:bg-gray-100 text-black text-xs px-3 py-2 gap-1.5 shadow-brutal-xs font-black whitespace-nowrap"
            title="Khôi phục toàn bộ về text mặc định"
          >
            <RotateCcw className="w-3.5 h-3.5 text-red-600" />
            <span>Khôi Phục Mặc Định</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="neo-btn bg-brand-yellow hover:bg-yellow-400 text-black text-xs sm:text-sm px-4 py-2 gap-1.5 shadow-brutal font-black whitespace-nowrap"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Đang Lưu...' : 'Lưu Thay Đổi Text'}</span>
          </button>
        </div>
      </div>

      {/* FILTER TABS & SEARCH BAR */}
      <div className="p-4 bg-brand-paper border-b-2 border-black flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        {/* Section Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 scrollbar-none">
          {sections.map((sec) => {
            const isSelected = selectedSection === sec;
            const label =
              sec === 'ALL'
                ? `Tất Cả (${SITE_TEXT_DEFINITIONS.length})`
                : sec;
            return (
              <button
                key={sec}
                type="button"
                onClick={() => setSelectedSection(sec)}
                className={`neo-btn text-xs px-3 py-1.5 whitespace-nowrap font-bold ${
                  isSelected
                    ? 'bg-black text-white shadow-brutal-xs font-black'
                    : 'bg-white hover:bg-gray-100 text-black'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm theo từ khóa, vị trí..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="neo-input pl-10 pr-3 py-1.5 text-xs w-full bg-white"
          />
        </div>
      </div>

      {/* EXCEL SPREADSHEET TABLE */}
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full text-left border-collapse font-sans text-xs">
          <thead className="sticky top-0 z-20 bg-gray-100 border-b-2 border-black shadow-sm">
            <tr className="text-[11px] font-black uppercase text-gray-700 font-cocogoose">
              <th className="p-2.5 w-12 text-center bg-gray-200 border-r border-gray-300">
                #
              </th>
              <th className="p-2.5 w-36 border-r border-gray-300">
                Khu Vực
              </th>
              <th className="p-2.5 w-52 border-r border-gray-300">
                Vị Trí / Chức Năng
              </th>
              <th className="p-2.5 min-w-[340px] border-r border-gray-300 bg-amber-50/80">
                Nội Dung Đang Áp Dụng (Nhấp vào để sửa trực tiếp)
              </th>
              <th className="p-2.5 min-w-[260px] text-gray-500 border-r border-gray-300">
                Giá Trị Mặc Định
              </th>
              <th className="p-2.5 w-24 text-right">
                Thao Tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400 italic">
                  Không tìm thấy dòng text nào khớp với từ khóa tìm kiếm.
                </td>
              </tr>
            ) : (
              filteredRows.map((item, idx) => {
                const currentText = siteTexts[item.id] ?? item.defaultValue;
                const isModified = currentText !== item.defaultValue;
                const isLongText = item.defaultValue.length > 50;
                const isActive = activeCellId === item.id;

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      isModified
                        ? 'bg-amber-50/50 hover:bg-amber-100/60'
                        : idx % 2 === 0
                        ? 'bg-white hover:bg-gray-50'
                        : 'bg-[#fafaf8] hover:bg-gray-50'
                    }`}
                  >
                    {/* Col A: Row Index */}
                    <td className="p-2.5 text-center font-mono font-bold text-gray-500 bg-gray-100/70 border-r border-gray-300">
                      {idx + 1}
                    </td>

                    {/* Col B: Section */}
                    <td className="p-2.5 whitespace-nowrap border-r border-gray-300 font-bold">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black border border-black bg-white shadow-brutal-xs">
                        {item.section}
                      </span>
                    </td>

                    {/* Col C: Location */}
                    <td className="p-2.5 border-r border-gray-300">
                      <span className="font-extrabold text-black block leading-tight">
                        {item.location}
                      </span>
                      <code className="text-[10px] text-gray-400 font-mono block mt-0.5">
                        {item.id}
                      </code>
                    </td>

                    {/* Col D: Editable Cell (Spreadsheet Cell) */}
                    <td
                      className={`p-2 border-r border-gray-300 ${
                        isActive
                          ? 'bg-amber-100/90 ring-2 ring-brand-yellow ring-inset'
                          : ''
                      }`}
                    >
                      <div className="space-y-1">
                        {isLongText ? (
                          <textarea
                            rows={2}
                            value={currentText}
                            onFocus={() => setActiveCellId(item.id)}
                            onBlur={() => setActiveCellId(null)}
                            onChange={(e) => handleCellChange(item.id, e.target.value)}
                            className={`w-full p-2 text-xs font-semibold rounded border-2 transition-all resize-y ${
                              isModified
                                ? 'border-brand-red bg-white font-bold text-black shadow-sm'
                                : 'border-gray-300 bg-white hover:border-black text-gray-900 focus:border-black'
                            }`}
                          />
                        ) : (
                          <input
                            type="text"
                            value={currentText}
                            onFocus={() => setActiveCellId(item.id)}
                            onBlur={() => setActiveCellId(null)}
                            onChange={(e) => handleCellChange(item.id, e.target.value)}
                            className={`w-full p-2 text-xs font-semibold rounded border-2 transition-all ${
                              isModified
                                ? 'border-brand-red bg-white font-black text-black shadow-sm'
                                : 'border-gray-300 bg-white hover:border-black text-gray-900 focus:border-black'
                            }`}
                          />
                        )}

                        {isModified && (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-red">
                            <span className="w-2 h-2 bg-brand-red rounded-full animate-ping inline-block" />
                            <span>Đã chỉnh sửa (khác mặc định)</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Col E: Default Value Reference */}
                    <td className="p-2.5 border-r border-gray-300 text-gray-500 font-medium select-none">
                      <p className="line-clamp-2 italic text-[11px]" title={item.defaultValue}>
                        {item.defaultValue}
                      </p>
                    </td>

                    {/* Col F: Row Action */}
                    <td className="p-2.5 text-right whitespace-nowrap">
                      {isModified ? (
                        <button
                          type="button"
                          onClick={() => handleResetRow(item.id, item.defaultValue)}
                          className="neo-btn bg-white hover:bg-gray-100 text-black p-1 text-[10px] gap-1 shadow-brutal-xs"
                          title="Hoàn tác về mặc định"
                        >
                          <Undo2 className="w-3.5 h-3.5 text-amber-600" />
                          <span>Hủy</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-bold italic">
                          Mặc định
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* EXCEL STATUS BAR AT BOTTOM */}
      <div className="p-3 bg-gray-100 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-gray-700">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-700" />
          <span>
            Hiển thị <strong>{filteredRows.length}</strong> / <strong>{SITE_TEXT_DEFINITIONS.length}</strong> dòng text •{' '}
            <strong className="text-brand-red">{modifiedCount}</strong> dòng đã được tùy biến.
          </span>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving}
          className="neo-btn bg-brand-yellow hover:bg-yellow-400 text-black px-6 py-2 text-xs sm:text-sm font-black gap-2 shadow-brutal"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Đang Lưu Toàn Bộ...' : 'Lưu Tất Cả Thay Đổi Vào Database'}</span>
        </button>
      </div>
    </div>
  );
}

