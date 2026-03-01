import type { CanvasElement } from "./types";

export const renderElementToHtml = (element: CanvasElement): string => {
  switch (element.type) {
    case "text":
      return `<p class="text-sm text-foreground">${escapeHtml(String(element.props.content ?? ""))}</p>`;
    case "button":
      return `<button class="ui-btn-primary text-xs px-3 py-1.5">${escapeHtml(String(element.props.label ?? "Button"))}</button>`;
    case "input":
      return `<input type="text" placeholder="${escapeHtml(String(element.props.placeholder ?? ""))}" class="ui-input w-full text-xs" />`;
    case "image":
      return `<img src="${escapeHtml(String(element.props.src ?? ""))}" alt="${escapeHtml(String(element.props.alt ?? ""))}" class="rounded-md max-w-full" />`;
    case "card":
      return `<div class="ui-card p-3"><h4 class="text-sm font-semibold">${escapeHtml(String(element.props.title ?? ""))}</h4><p class="text-xs text-muted-foreground mt-1">${escapeHtml(String(element.props.description ?? ""))}</p></div>`;
    case "list": {
      const items = Array.isArray(element.props.items) ? element.props.items : [];
      return `<ul class="list-disc pl-4 text-xs text-foreground space-y-1">${items.map((item) => `<li>${escapeHtml(String(item))}</li>`).join("")}</ul>`;
    }
    case "chart":
      return `<div class="ui-card p-3 text-center"><p class="text-xs text-muted-foreground">Chart: ${escapeHtml(String(element.props.type ?? "bar"))}</p><p class="text-lg font-bold">${escapeHtml(String(element.props.title ?? "Chart"))}</p></div>`;
    case "table": {
      const headers = Array.isArray(element.props.headers) ? element.props.headers : [];
      const rows = Array.isArray(element.props.rows) ? element.props.rows : [];
      return `<table class="w-full text-xs"><thead><tr>${headers.map((h: unknown) => `<th class="border-b border-border px-2 py-1 text-left font-medium">${escapeHtml(String(h))}</th>`).join("")}</tr></thead><tbody>${rows.map((row: unknown) => `<tr>${(Array.isArray(row) ? row : []).map((cell: unknown) => `<td class="border-b border-border/50 px-2 py-1">${escapeHtml(String(cell))}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
    }
    default:
      return `<div class="text-xs text-muted-foreground">Unknown element: ${element.type}</div>`;
  }
};

const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const renderLayoutToHtml = (elements: CanvasElement[]): string =>
  elements.map(renderElementToHtml).join("\n");
