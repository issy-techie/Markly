import React from "react";
import { X } from "lucide-react";
import Modal from "../ui/Modal";
import { useI18n } from "../../hooks/useI18n";
import { version } from "../../../package.json";

interface AboutDialogProps {
  onClose: () => void;
}

const AboutDialog: React.FC<AboutDialogProps> = ({ onClose }) => {
  const t = useI18n();
  return (
    <Modal onClose={onClose} className="w-[320px] text-center">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <span className="font-bold text-sm">{t.aboutTitle}</span>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"><X size={16} /></button>
      </div>
      <div className="p-6 space-y-3">
        <div className="text-3xl font-bold tracking-tighter italic text-blue-600 dark:text-blue-400">Markly</div>
        <div className="text-xs text-slate-500">Lightweight Markdown Editor</div>
        <div className="text-sm font-mono text-slate-600 dark:text-slate-400">Version {version}</div>
        <div className="text-xs text-slate-400 pt-2">Built with Tauri + React</div>
        <div className="text-xs text-slate-400">Copyright (c) 2026 issy-techie</div>
      </div>
    </Modal>
  );
};

export default AboutDialog;
