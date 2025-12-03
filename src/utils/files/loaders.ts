/**
 * Load image from file
 */
export function loadImageFromFile(file: File): Promise<{ image: HTMLImageElement; imageData: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result !== 'string' || !result) {
        reject(new Error('Failed to read file: result is empty or invalid'));
        return;
      }
      const img = new Image();
      img.onload = () => {
        resolve({
          image: img,
          imageData: result
        });
      };
      img.onerror = () => {
        reject(new Error('Failed to decode image file. Make sure it is a valid image.'));
      };
      img.src = result;
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.onabort = () => {
      reject(new Error('File reading was aborted'));
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

