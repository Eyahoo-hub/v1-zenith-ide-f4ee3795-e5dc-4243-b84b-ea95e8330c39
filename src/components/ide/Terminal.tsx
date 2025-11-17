import React, { useEffect, useRef } from 'react';
import { Terminal as XtermTerminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { useTheme } from '@/hooks/use-theme';
const darkTheme = {
  background: '#171717', // neutral-900
  foreground: '#fafafa', // neutral-50
  cursor: '#fafafa',
  selectionBackground: '#6366f1', // indigo-500
  black: '#171717',
  brightBlack: '#525252',
  red: '#ef4444',
  brightRed: '#f87171',
  green: '#22c55e',
  brightGreen: '#4ade80',
  yellow: '#eab308',
  brightYellow: '#fde047',
  blue: '#3b82f6',
  brightBlue: '#60a5fa',
  magenta: '#a855f7',
  brightMagenta: '#c084fc',
  cyan: '#06b6d4',
  brightCyan: '#22d3ee',
  white: '#e5e5e5',
  brightWhite: '#fafafa',
};
const lightTheme = {
  background: '#ffffff',
  foreground: '#0a0a0a',
  cursor: '#0a0a0a',
  selectionBackground: '#818cf8', // indigo-400
  black: '#171717',
  brightBlack: '#525252',
  red: '#dc2626',
  brightRed: '#ef4444',
  green: '#16a34a',
  brightGreen: '#22c55e',
  yellow: '#ca8a04',
  brightYellow: '#eab308',
  blue: '#2563eb',
  brightBlue: '#3b82f6',
  magenta: '#9333ea',
  brightMagenta: '#a855f7',
  cyan: '#0891b2',
  brightCyan: '#06b6d4',
  white: '#e5e5e5',
  brightWhite: '#fafafa',
};
export function Terminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XtermTerminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const { isDark } = useTheme();
  useEffect(() => {
    if (terminalRef.current && !xtermRef.current) {
      const term = new XtermTerminal({
        cursorBlink: true,
        fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
        fontSize: 14,
        theme: isDark ? darkTheme : lightTheme,
      });
      const fitAddon = new FitAddon();
      xtermRef.current = term;
      fitAddonRef.current = fitAddon;
      term.loadAddon(fitAddon);
      term.open(terminalRef.current);
      fitAddon.fit();
      term.writeln('Welcome to Zenith IDE Terminal!');
      term.writeln('This is a placeholder UI. Full functionality will be added later.');
      term.write('$ ');
    }
  }, [isDark]);
  useEffect(() => {
    if (xtermRef.current) {
      xtermRef.current.options.theme = isDark ? darkTheme : lightTheme;
    }
  }, [isDark]);
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      fitAddonRef.current?.fit();
    });
    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current);
    }
    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  return <div ref={terminalRef} className="h-full w-full p-2 bg-background" />;
}