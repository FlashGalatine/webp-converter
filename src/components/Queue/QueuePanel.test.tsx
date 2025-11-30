import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../test/helpers/renderWithProviders'
import userEvent from '@testing-library/user-event'
import QueuePanel from './QueuePanel'
import type { ImageQueueItem } from '../../types'

describe('QueuePanel Component', () => {
  const createMockQueueItem = (id: number, name: string): ImageQueueItem => ({
    id,
    file: new File(['test'], name, { type: 'image/png' }),
    name,
    size: 1000,
    type: 'image/png'
  })

  const defaultProps = {
    imageQueue: [] as ImageQueueItem[],
    currentImageIndex: -1,
    processedImages: new Set<number>(),
    removeAfterConvert: false,
    onLoadImage: vi.fn(),
    onRemoveImage: vi.fn(),
    onClearQueue: vi.fn(),
    onPrevious: vi.fn(),
    onNext: vi.fn(),
    onToggleRemoveAfterConvert: vi.fn()
  }

  describe('when queue is empty', () => {
    it('should not render anything', () => {
      const { container } = render(<QueuePanel {...defaultProps} />)

      expect(container.firstChild).toBeNull()
    })
  })

  describe('when queue has items', () => {
    const mockQueue = [
      createMockQueueItem(1, 'image1.png'),
      createMockQueueItem(2, 'image2.jpg'),
      createMockQueueItem(3, 'image3.webp')
    ]

    it('should render queue items', () => {
      render(<QueuePanel {...defaultProps} imageQueue={mockQueue} currentImageIndex={0} />)

      expect(screen.getByText('image1.png')).toBeInTheDocument()
      expect(screen.getByText('image2.jpg')).toBeInTheDocument()
      expect(screen.getByText('image3.webp')).toBeInTheDocument()
    })

    it('should show queue count', () => {
      const processedImages = new Set([0])
      render(<QueuePanel {...defaultProps} imageQueue={mockQueue} currentImageIndex={0} processedImages={processedImages} />)

      expect(screen.getByText(/Image Queue \(1\/3\)/)).toBeInTheDocument()
    })

    it('should highlight current image', () => {
      render(<QueuePanel {...defaultProps} imageQueue={mockQueue} currentImageIndex={1} />)

      // Find the parent row div that has the highlight class
      const textElement = screen.getByText('image2.jpg')
      const rowElement = textElement.closest('[class*="bg-amber"]')
      expect(rowElement).toBeInTheDocument()
    })

    it('should show processed indicator', () => {
      const processedImages = new Set([0, 2])
      render(<QueuePanel {...defaultProps} imageQueue={mockQueue} currentImageIndex={1} processedImages={processedImages} />)

      // Should show checkmarks for processed items
      const checkmarks = screen.getAllByText('✓')
      expect(checkmarks).toHaveLength(2)
    })

    it('should show current item indicator', () => {
      render(<QueuePanel {...defaultProps} imageQueue={mockQueue} currentImageIndex={0} />)

      expect(screen.getByText('▶')).toBeInTheDocument()
    })

    it('should render Clear All button', () => {
      render(<QueuePanel {...defaultProps} imageQueue={mockQueue} currentImageIndex={0} />)

      expect(screen.getByText('Clear All')).toBeInTheDocument()
    })

    it('should render Previous button', () => {
      render(<QueuePanel {...defaultProps} imageQueue={mockQueue} currentImageIndex={0} />)

      expect(screen.getByText('← Previous')).toBeInTheDocument()
    })

    it('should render Next button', () => {
      render(<QueuePanel {...defaultProps} imageQueue={mockQueue} currentImageIndex={0} />)

      expect(screen.getByText('Next →')).toBeInTheDocument()
    })

    it('should render remove after convert checkbox', () => {
      render(<QueuePanel {...defaultProps} imageQueue={mockQueue} currentImageIndex={0} />)

      expect(screen.getByText('Remove from queue after converting')).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    const mockQueue = [
      createMockQueueItem(1, 'image1.png'),
      createMockQueueItem(2, 'image2.jpg')
    ]

    it('should call onLoadImage when clicking queue item', async () => {
      const onLoadImage = vi.fn()
      render(<QueuePanel {...defaultProps} imageQueue={mockQueue} currentImageIndex={0} onLoadImage={onLoadImage} />)

      await userEvent.click(screen.getByText('image2.jpg'))

      expect(onLoadImage).toHaveBeenCalledWith(1)
    })

    it('should call onRemoveImage when clicking remove button', async () => {
      const onRemoveImage = vi.fn()
      render(<QueuePanel {...defaultProps} imageQueue={mockQueue} currentImageIndex={0} onRemoveImage={onRemoveImage} />)

      const removeButtons = screen.getAllByText('✕')
      await userEvent.click(removeButtons[0])

      expect(onRemoveImage).toHaveBeenCalledWith(0)
    })

    it('should call onClearQueue when clicking Clear All', async () => {
      const onClearQueue = vi.fn()
      render(<QueuePanel {...defaultProps} imageQueue={mockQueue} currentImageIndex={0} onClearQueue={onClearQueue} />)

      await userEvent.click(screen.getByText('Clear All'))

      expect(onClearQueue).toHaveBeenCalled()
    })

    it('should call onPrevious when clicking Previous', async () => {
      const onPrevious = vi.fn()
      render(<QueuePanel {...defaultProps} imageQueue={mockQueue} currentImageIndex={1} onPrevious={onPrevious} />)

      await userEvent.click(screen.getByText('← Previous'))

      expect(onPrevious).toHaveBeenCalled()
    })

    it('should call onNext when clicking Next', async () => {
      const onNext = vi.fn()
      render(<QueuePanel {...defaultProps} imageQueue={mockQueue} currentImageIndex={0} onNext={onNext} />)

      await userEvent.click(screen.getByText('Next →'))

      expect(onNext).toHaveBeenCalled()
    })

    it('should call onToggleRemoveAfterConvert when toggling checkbox', async () => {
      const onToggleRemoveAfterConvert = vi.fn()
      render(<QueuePanel {...defaultProps} imageQueue={mockQueue} currentImageIndex={0} onToggleRemoveAfterConvert={onToggleRemoveAfterConvert} />)

      const checkbox = screen.getByRole('checkbox')
      await userEvent.click(checkbox)

      expect(onToggleRemoveAfterConvert).toHaveBeenCalledWith(true)
    })
  })

  describe('button states', () => {
    const mockQueue = [
      createMockQueueItem(1, 'image1.png'),
      createMockQueueItem(2, 'image2.jpg')
    ]

    it('should disable Previous button when at first image', () => {
      render(<QueuePanel {...defaultProps} imageQueue={mockQueue} currentImageIndex={0} />)

      const prevButton = screen.getByText('← Previous')
      expect(prevButton).toBeDisabled()
    })

    it('should enable Previous button when not at first image', () => {
      render(<QueuePanel {...defaultProps} imageQueue={mockQueue} currentImageIndex={1} />)

      const prevButton = screen.getByText('← Previous')
      expect(prevButton).not.toBeDisabled()
    })

    it('should disable Next button when at last image', () => {
      render(<QueuePanel {...defaultProps} imageQueue={mockQueue} currentImageIndex={1} />)

      const nextButton = screen.getByText('Next →')
      expect(nextButton).toBeDisabled()
    })

    it('should enable Next button when not at last image', () => {
      render(<QueuePanel {...defaultProps} imageQueue={mockQueue} currentImageIndex={0} />)

      const nextButton = screen.getByText('Next →')
      expect(nextButton).not.toBeDisabled()
    })
  })

  describe('checkbox state', () => {
    const mockQueue = [createMockQueueItem(1, 'image1.png')]

    it('should show unchecked by default', () => {
      render(<QueuePanel {...defaultProps} imageQueue={mockQueue} currentImageIndex={0} removeAfterConvert={false} />)

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()
    })

    it('should show checked when removeAfterConvert is true', () => {
      render(<QueuePanel {...defaultProps} imageQueue={mockQueue} currentImageIndex={0} removeAfterConvert={true} />)

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
    })
  })
})
