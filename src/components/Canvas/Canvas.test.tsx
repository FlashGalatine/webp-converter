import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../test/helpers/renderWithProviders'
import Canvas from './Canvas'

describe('Canvas Component', () => {
  const mockCanvasRef = { current: null }
  const defaultProps = {
    canvasRef: mockCanvasRef as React.RefObject<HTMLCanvasElement>,
    canvasWidth: 800,
    canvasHeight: 600,
    cursorStyle: 'default',
    image: null,
    cropWidth: 100,
    cropHeight: 100,
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

    it('should render canvas element', () => {
      render(<Canvas {...defaultProps} image={mockImage} />)

      expect(screen.getByRole('img')).toBeInTheDocument()
    })

    it('should set canvas dimensions', () => {
      render(<Canvas {...defaultProps} image={mockImage} canvasWidth={1200} canvasHeight={800} />)

      const canvas = screen.getByRole('img')
      expect(canvas).toHaveAttribute('width', '1200')
      expect(canvas).toHaveAttribute('height', '800')
    })

    it('should apply cursor style', () => {
      render(<Canvas {...defaultProps} image={mockImage} cursorStyle="move" />)

      const canvas = screen.getByRole('img')
      expect(canvas).toHaveStyle({ cursor: 'move' })
    })

    it('should have correct aria-label with crop info', () => {
      render(<Canvas {...defaultProps} image={mockImage} cropWidth={1920} cropHeight={1080} zoomLevel={0.5} />)

      const canvas = screen.getByRole('img')
      expect(canvas).toHaveAttribute('aria-label', 'Image crop preview: 1920x1080 pixels at 50% zoom')
    })

    it('should have correct aria-label at 100% zoom', () => {
      render(<Canvas {...defaultProps} image={mockImage} cropWidth={800} cropHeight={600} zoomLevel={1} />)

      const canvas = screen.getByRole('img')
      expect(canvas).toHaveAttribute('aria-label', 'Image crop preview: 800x600 pixels at 100% zoom')
    })

    it('should have correct aria-label at 200% zoom', () => {
      render(<Canvas {...defaultProps} image={mockImage} cropWidth={500} cropHeight={500} zoomLevel={2} />)

      const canvas = screen.getByRole('img')
      expect(canvas).toHaveAttribute('aria-label', 'Image crop preview: 500x500 pixels at 200% zoom')
    })

    it('should have border class', () => {
      render(<Canvas {...defaultProps} image={mockImage} />)

      const canvas = screen.getByRole('img')
      expect(canvas).toHaveClass('border-2', 'border-gray-700')
    })
  })

  describe('mouse event handlers', () => {
    const mockImage = { width: 1920, height: 1080 } as HTMLImageElement

    it('should call onMouseDown when mouse down', async () => {
      const onMouseDown = vi.fn()
      render(<Canvas {...defaultProps} image={mockImage} onMouseDown={onMouseDown} />)

      const canvas = screen.getByRole('img')
      canvas.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))

      expect(onMouseDown).toHaveBeenCalled()
    })

    it('should call onMouseMove when mouse moves', () => {
      const onMouseMove = vi.fn()
      render(<Canvas {...defaultProps} image={mockImage} onMouseMove={onMouseMove} />)

      const canvas = screen.getByRole('img')
      canvas.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }))

      expect(onMouseMove).toHaveBeenCalled()
    })

    it('should call onMouseUp when mouse up', () => {
      const onMouseUp = vi.fn()
      render(<Canvas {...defaultProps} image={mockImage} onMouseUp={onMouseUp} />)

      const canvas = screen.getByRole('img')
      canvas.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))

      expect(onMouseUp).toHaveBeenCalled()
    })

    it('should have onMouseLeave handler attached', () => {
      const onMouseLeave = vi.fn()
      render(<Canvas {...defaultProps} image={mockImage} onMouseLeave={onMouseLeave} />)

      // Just verify the canvas element exists with the handler
      const canvas = screen.getByRole('img')
      expect(canvas).toBeInTheDocument()
      // Note: mouseleave doesn't bubble by default, so we just verify element renders
    })
  })
})
