const AVATAR_SIZE = 1024;
const BANNER_WIDTH = 1600;

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not read the SVG file.'));
    img.src = url;
  });
}

/**
 * The backend only accepts raster images, so turn an SVG into a PNG on a white
 * background (avatar: square, fitted and centered; banner: fixed width). Any
 * other file is returned untouched.
 */
export async function rasterizeSvg(
  file: File,
  kind: 'avatar' | 'banner',
): Promise<File> {
  if (file.type !== 'image/svg+xml') return file;

  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    // SVGs without explicit width/height can report 0; assume a square
    const srcWidth = img.naturalWidth || AVATAR_SIZE;
    const srcHeight = img.naturalHeight || srcWidth;

    const canvas = document.createElement('canvas');
    let drawWidth: number;
    let drawHeight: number;
    if (kind === 'avatar') {
      canvas.width = AVATAR_SIZE;
      canvas.height = AVATAR_SIZE;
      const scale = Math.min(AVATAR_SIZE / srcWidth, AVATAR_SIZE / srcHeight);
      drawWidth = srcWidth * scale;
      drawHeight = srcHeight * scale;
    } else {
      canvas.width = BANNER_WIDTH;
      canvas.height = Math.round((BANNER_WIDTH * srcHeight) / srcWidth);
      drawWidth = canvas.width;
      drawHeight = canvas.height;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not convert the SVG file.');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      img,
      (canvas.width - drawWidth) / 2,
      (canvas.height - drawHeight) / 2,
      drawWidth,
      drawHeight,
    );

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/png'),
    );
    if (!blob) throw new Error('Could not convert the SVG file.');
    const name = file.name.replace(/\.svg$/i, '') + '.png';
    return new File([blob], name, { type: 'image/png' });
  } finally {
    URL.revokeObjectURL(url);
  }
}
