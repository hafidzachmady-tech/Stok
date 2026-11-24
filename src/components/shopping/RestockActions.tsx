"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { useToast } from "@/components/Toast";

export function RestockActions({ shareText, disabled }: { shareText: string; disabled: boolean }) {
  const { notify } = useToast();
  const [copied, setCopied] = useState(false);

  async function copyList() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
      } else {
        const area = document.createElement("textarea");
        area.value = shareText;
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
      }
      setCopied(true);
      notify("Daftar belanja disalin ke clipboard.", "success");
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      notify("Gagal menyalin. Blok teks daftar lalu salin secara manual.", "error");
    }
  }

  const waHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="no-print flex flex-wrap gap-2">
      <button type="button" onClick={copyList} className="btn-secondary" disabled={disabled}>
        <Icon name={copied ? "check" : "copy"} size={16} />
        {copied ? "Tersalin" : "Salin daftar"}
      </button>
      {disabled ? (
        <span className="btn-primary cursor-not-allowed opacity-60" aria-disabled="true">
          <Icon name="whatsapp" size={16} />
          Bagikan WhatsApp
        </span>
      ) : (
        <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn-primary">
          <Icon name="whatsapp" size={16} />
          Bagikan WhatsApp
        </a>
      )}
      <button type="button" onClick={() => window.print()} className="btn-secondary" disabled={disabled}>
        <Icon name="print" size={16} />
        Cetak
      </button>
    </div>
  );
}
