import React, { useState } from "react";
import {
  ArrowUpFromLine,
  ArrowDownFromLine,
  ArrowLeftFromLine,
  ArrowRightFromLine,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  WrapText,
  Plus,
  ChevronDown,
} from "lucide-react";
import { useI18n } from "../../hooks/useI18n";
import type { ParsedTable, Alignment } from "../../utils/tableParser";

interface TableToolbarProps {
  table: ParsedTable;
  /** Data row index the cursor is on (0-based, -1 for header row) */
  cursorRowIndex: number;
  /** Column index the cursor is on (0-based) */
  cursorColIndex: number;
  /** Position (in pixels) to render the toolbar */
  top: number;
  left: number;
  onInsertRowAbove: () => void;
  onInsertRowBelow: () => void;
  onDeleteRow: () => void;
  onInsertColumnLeft: () => void;
  onInsertColumnRight: () => void;
  onDeleteColumn: () => void;
  onSetAlignment: (alignment: Alignment) => void;
  onFormatTable: () => void;
  onInsertNewTable: (rows: number, cols: number) => void;
}

const ToolbarButton: React.FC<{
  onClick: () => void;
  title: string;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}> = ({ onClick, title, disabled, danger, children }) => (
  <button
    onClick={onClick}
    title={title}
    disabled={disabled}
    className={`p-1 rounded transition-colors ${
      disabled
        ? "text-slate-300 dark:text-slate-600 cursor-not-allowed"
        : danger
        ? "text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
        : "text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20"
    }`}
  >
    {children}
  </button>
);

const Divider: React.FC = () => (
  <div className="w-px h-5 bg-slate-200 dark:bg-slate-600 mx-0.5" />
);

const TableToolbar: React.FC<TableToolbarProps> = ({
  table,
  cursorRowIndex,
  onInsertRowAbove,
  onInsertRowBelow,
  onDeleteRow,
  onInsertColumnLeft,
  onInsertColumnRight,
  onDeleteColumn,
  onSetAlignment,
  onFormatTable,
  onInsertNewTable,
  top,
  left,
}) => {
  const t = useI18n();
  const [showNewTablePopover, setShowNewTablePopover] = useState(false);
  const [newRows, setNewRows] = useState(3);
  const [newCols, setNewCols] = useState(3);
  const isHeaderRow = cursorRowIndex < 0;

  return (
    <div
      className="table-toolbar"
      style={{ top, left }}
      onMouseDown={(e) => e.preventDefault()} // prevent editor blur
    >
      {/* Row operations */}
      <ToolbarButton onClick={onInsertRowAbove} title={t.tableInsertRowAbove}>
        <ArrowUpFromLine size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={onInsertRowBelow} title={t.tableInsertRowBelow}>
        <ArrowDownFromLine size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={onDeleteRow}
        title={t.tableDeleteRow}
        disabled={isHeaderRow || table.rows.length <= 1}
        danger
      >
        <Trash2 size={14} />
      </ToolbarButton>

      <Divider />

      {/* Column operations */}
      <ToolbarButton onClick={onInsertColumnLeft} title={t.tableInsertColumnLeft}>
        <ArrowLeftFromLine size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={onInsertColumnRight} title={t.tableInsertColumnRight}>
        <ArrowRightFromLine size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={onDeleteColumn}
        title={t.tableDeleteColumn}
        disabled={table.headers.length <= 1}
        danger
      >
        <Trash2 size={14} />
      </ToolbarButton>

      <Divider />

      {/* Alignment */}
      <ToolbarButton onClick={() => onSetAlignment("left")} title={t.tableAlignLeft}>
        <AlignLeft size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => onSetAlignment("center")} title={t.tableAlignCenter}>
        <AlignCenter size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => onSetAlignment("right")} title={t.tableAlignRight}>
        <AlignRight size={14} />
      </ToolbarButton>

      <Divider />

      {/* Format */}
      <ToolbarButton onClick={onFormatTable} title={t.tableFormat}>
        <WrapText size={14} />
      </ToolbarButton>

      {/* New table */}
      <div className="relative">
        <ToolbarButton
          onClick={() => setShowNewTablePopover((prev) => !prev)}
          title={t.tableInsertNew}
        >
          <Plus size={14} />
          <ChevronDown size={10} className="inline -ml-0.5" />
        </ToolbarButton>
        {showNewTablePopover && (
          <div
            className="absolute left-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-3 z-50 whitespace-nowrap"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{t.tableInsertNew}</div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-xs text-slate-600 dark:text-slate-300">{t.tableRows}</label>
              <input
                type="number"
                min={1}
                max={20}
                value={newRows}
                onChange={(e) => setNewRows(Math.max(1, Math.min(20, Number(e.target.value))))}
                className="w-14 px-1.5 py-0.5 text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
              />
              <label className="text-xs text-slate-600 dark:text-slate-300">{t.tableColumns}</label>
              <input
                type="number"
                min={1}
                max={10}
                value={newCols}
                onChange={(e) => setNewCols(Math.max(1, Math.min(10, Number(e.target.value))))}
                className="w-14 px-1.5 py-0.5 text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
              />
            </div>
            <button
              onClick={() => {
                onInsertNewTable(newRows, newCols);
                setShowNewTablePopover(false);
              }}
              className="w-full px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              {t.ok}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableToolbar;
