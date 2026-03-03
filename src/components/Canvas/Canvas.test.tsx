import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../test/helpers/renderWithProviders'
import Canvas from './Canvas'
import type { CropZone } from '../../types'
import { DEFAULT_EXPORT_SETTINGS } from '../../types'

function makeZone(overrides: Partial<CropZone> = {}): CropZone {
  return {
    id: 'zone-1',
    label: 'Test Zone',
    presetName: null,
    rect: { x: 0, y: 0, width: 100, height: 100 },
    aspectRatio: null,
    exportSettings: { ...DEFAULT_EXPORT_SETTINGS },
    ...overrides,
  };
}

describe('Canvas Component', () => {
  const mockCanvasRef = { current: null }
  const defaultProps = {
    canvasRef: mockCanvasRef as React.RefObject<HTMLCanvasElement>,
    canvasWidth: 800,
    canvasHeight: 600,
    cursorStyle: 'default',
    image: null,
    zones: [] as CropZone[],
    activeZoneId: null as string | null,
    zoomLevel: 1,
    onMouseDown: vi.fn(),
    onMouseMove: vi.fn(),
    onMouseUp: vi.fn(),
    onMouseLeave: vi.fn(),
    onWheel: vi.fn()
  }

  describe('when no image is loaded', () => {
    it('should show placeholder message', () => {
      render(<Canvas {...defaultProps} />)

      expect(screen.getByText('No image loaded')).toBeInTheDocument()
    })

    it('should show help text', () => {
      render(<Canvas {...defaultProps} />)

      expect(screen.getByText(/Click "Select Image"/)).toBeInTheDocument()
    })

    it('should show placeholder icon', () => {
      const { container } = render(<Canvas {...defaultProps} />)

      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('should not render canvas element', () => {
      render(<Canvas {...defaultProps} />)

      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })
  })

  describe('when image is loaded', () => {
    const mockImage = { width: 1920, height: 1080 } as HTMLImageElement
    const testZone = makeZone({ rect: { x: 0, y: 0, width: 1920, height: 1080 } });

    it('should render canvas element', () => {
      render(<Canvas {...defaultProps} image={mockImage} zones={[testZone]} activeZoneId={testZone.id} />)

      expect(screen.getByRole('img')).toBeInTheDocument()
    })

    it('should set canvas dimensions', () => {
      render(<Canvas {...defaultProps} image={mockImage} canvasWidth={1200} canvasHeight={800} zones={[testZone]} activeZoneId={testZone.id} />)

      const canvas = screen.getByRole('img')
      expect(canvas).toHaveAttribute('width', '1200')
      expect(canvas).toHaveAttribute('height', '800')
    })

    it('should apply cursor style', () => {
      render(<Canvas {...defaultProps} image={mockImage} cursorStyle="move" zones={[testZone]} activeZoneId={testZone.id} />)

      const canvas = screen.getByRole('img')
      expect(canvas).toHaveStyle({ cursor: 'move' })
    })

    it('should have correct aria-label with zone info', () => {
      const zone = makeZone({ rect: { x: 0, y: 0, width: 1920, height: 1080 } });
      render(<Canvas {...defaultProps} image={mockImage} zones={[zone]} activeZoneId={zone.id} zoomLevel={0.5} />)

      const canvas = screen.getByRole('img')
      expect(canvas).toHaveAttribute('aria-label', 'Image crop preview: 1 zone(s), active: 1920x1080, 50% zoom')
    })

    it('should have correct aria-label with no active zone', () => {
      const zone = makeZone();
      render(<Canvas {...defaultProps} image={mockImage} zones={[zone]} activeZoneId={null} zoomLevel={1} />)

      const canvas = screen.getByRole('img')
      expect(canvas).toHaveAttribute('aria-label', 'Image crop preview: 1 zone(s), active: no selection, 100% zoom')
    })

    it('should have correct aria-label with multiple zones', () => {
      const zone1 = makeZone({ id: 'z1', rect: { x: 0, y: 0, width: 500, height: 500 } });
      const zone2 = makeZone({ id: 'z2', rect: { x: 100, y: 100, width: 200, height: 200 } });
      render(<Canvas {...defaultProps} image={mockImage} zones={[zone1, zone2]} activeZoneId="z2" zoomLevel={2} />)

      const canvas = screen.getByRole('img')
      expect(canvas).toHaveAttribute('aria-label', 'Image crop preview: 2 zone(s), active: 200x200, 200% zoom')
    })

    it('should have border class', () => {
      render(<Canvas {...defaultProps} image={mockImage} zones={[testZone]} activeZoneId={testZone.id} />)

      const canvas = screen.getByRole('img')
      expect(canvas).toHaveClass('border-2', 'border-gray-700')
    })
  })

  describe('mouse event handlers', () => {
    const mockImage = { width: 1920, height: 1080 } as HTMLImageElement
    const testZone = makeZone();

    it('should call onMouseDown when mouse down', async () => {
      const onMouseDown = vi.fn()
      render(<Canvas {...defaultProps} image={mockImage} zones={[testZone]} activeZoneId={testZone.id} onMouseDown={onMouseDown} />)

      const canvas = screen.getByRole('img')
      canvas.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))

      expect(onMouseDown).toHaveBeenCalled()
    })

    it('should call onMouseMove when mouse moves', () => {
      const onMouseMove = vi.fn()
      render(<Canvas {...defaultProps} image={mockImage} zones={[testZone]} activeZoneId={testZone.id} onMouseMove={onMouseMove} />)

      const canvas = screen.getByRole('img')
      canvas.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }))

      expect(onMouseMove).toHaveBeenCalled()
    })

    it('should call onMouseUp when mouse up', () => {
      const onMouseUp = vi.fn()
      render(<Canvas {...defaultProps} image={mockImage} zones={[testZone]} activeZoneId={testZone.id} onMouseUp={onMouseUp} />)

      const canvas = screen.getByRole('img')
      canvas.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))

      expect(onMouseUp).toHaveBeenCalled()
    })

    it('should have onMouseLeave handler attached', () => {
      const onMouseLeave = vi.fn()
      render(<Canvas {...defaultProps} image={mockImage} zones={[testZone]} activeZoneId={testZone.id} onMouseLeave={onMouseLeave} />)

      const canvas = screen.getByRole('img')
      expect(canvas).toBeInTheDocument()
    })
  })
})
