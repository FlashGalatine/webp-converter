/**
 * Load image from file
 */
export function loadImageFromFile(file: File): Promise<{ image: HTMLImageElement; imageData: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          image: img,
          imageData: e.target?.result as string
        });
      };
      img.onerror = () => {
        reject(new Error('Failed to decode image file. Make sure it is a valid image.'));
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Create a File object from a Blob with a generated name
 */
export function createFileFromBlob(blob: Blob, baseName: string = 'pasted-image'): File {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const extension = blob.type.split('/')[1] || 'png';
  const fileName = `${baseName}-${timestamp}.${extension}`;
  return new File([blob], fileName, { type: blob.type });
}

