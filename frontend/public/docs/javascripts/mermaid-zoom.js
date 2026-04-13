/**
 * Zoom + pan for Mermaid diagrams.
 * - Scroll wheel: zoom toward cursor
 * - Drag: pan
 * - Double-click: reset
 */
(function () {
  'use strict';

  function initZoom(container) {
    const svg = container.querySelector('svg');
    if (!svg || container.dataset.zoomReady) return;
    container.dataset.zoomReady = '1';

    // Mermaid wraps everything in a root <g>
    const rootG = svg.querySelector(':scope > g');
    if (!rootG) return;

    let scale = 1;
    let tx = 0;
    let ty = 0;
    let dragging = false;
    let startX = 0;
    let startY = 0;

    function applyTransform() {
      rootG.style.transformOrigin = '0 0';
      rootG.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    }

    // Scroll to zoom toward cursor position
    container.addEventListener('wheel', function (e) {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const factor = e.deltaY < 0 ? 1.1 : 0.9;
      const newScale = Math.min(Math.max(scale * factor, 0.2), 6);

      // Shift translate so zoom centers on cursor
      tx = mx - (mx - tx) * (newScale / scale);
      ty = my - (my - ty) * (newScale / scale);
      scale = newScale;

      applyTransform();
    }, { passive: false });

    // Drag to pan
    container.addEventListener('mousedown', function (e) {
      // Ignore right-click
      if (e.button !== 0) return;
      dragging = true;
      startX = e.clientX - tx;
      startY = e.clientY - ty;
    });

    window.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      tx = e.clientX - startX;
      ty = e.clientY - startY;
      applyTransform();
    });

    window.addEventListener('mouseup', function () {
      dragging = false;
    });

    // Double-click: reset to original position
    container.addEventListener('dblclick', function () {
      scale = 1;
      tx = 0;
      ty = 0;
      rootG.style.transition = 'transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)';
      applyTransform();
      setTimeout(function () {
        rootG.style.transition = '';
      }, 400);
    });
  }

  function scanAll() {
    document.querySelectorAll('.mermaid').forEach(initZoom);
  }

  // MkDocs Material renders Mermaid asynchronously — watch for SVG insertion
  const observer = new MutationObserver(scanAll);
  observer.observe(document.body, { childList: true, subtree: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scanAll);
  } else {
    scanAll();
  }
})();
