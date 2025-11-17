/**
 * Image processing constants
 */

/** Minimum blur radius for Gaussian blur */
export const MIN_BLUR_RADIUS = 0.5;

/** Blur threshold for determining when to apply anti-aliasing */
export const BLUR_THRESHOLD = 0.3;

/** Multiplier for Gaussian kernel size (kernel size = radius * multiplier) */
export const GAUSSIAN_KERNEL_MULTIPLIER = 3;

/** Lanczos window size (typically 3) */
export const LANCZOS_WINDOW_SIZE = 3;

/** Threshold for significant downsampling (triggers anti-aliasing when scale < this value) */
export const SIGNIFICANT_DOWNSAMPLE_THRESHOLD = 0.67;

/** Tolerance for detecting square images (aspect ratio ≈ 1) */
export const ASPECT_RATIO_TOLERANCE = 0.1;
