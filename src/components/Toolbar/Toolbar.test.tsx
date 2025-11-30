import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../test/helpers/renderWithProviders'
import userEvent from '@testing-library/user-event'
import Toolbar from './Toolbar'

describe('Toolbar Component', () => {
  const defaultProps = {
    fileInputRef: { current: null } as React.RefObject<HTMLInputElement>,
    presetFileInputRef: { current: null } as React.RefObject<HTMLInputElement>,
    onFileSelect: vi.fn(),
    onPresetFileSelect: vi.fn()
  }

  describe('rendering', () => {
    it('should render select images button', () => {
      render(<Toolbar {...defaultProps} />)

      expect(screen.getByRole('button', { name: /Select Image/i })).toBeInTheDocument()
    })

    it('should render section headers', () => {
      render(<Toolbar {...defaultProps} />)

      expect(screen.getByText('Load Image(s)')).toBeInTheDocument()
      expect(screen.getByText('Preset Source')).toBeInTheDocument()
    })

    it('should render preset editor link', () => {
      render(<Toolbar {...defaultProps} />)

      expect(screen.getByRole('link', { name: /Preset Editor/i })).toBeInTheDocument()
    })

    it('should have correct href for preset editor link', () => {
      render(<Toolbar {...defaultProps} />)

      const link = screen.getByRole('link', { name: /Preset Editor/i })
      expect(link).toHaveAttribute('href', '/preset-editor')
    })

    it('should render help text', () => {
      render(<Toolbar {...defaultProps} />)

      expect(screen.getByText(/Drag & drop/i)).toBeInTheDocument()
      expect(screen.getByText(/Ctrl\+V to paste/i)).toBeInTheDocument()
    })

    it('should render hidden file inputs', () => {
      const { container } = render(<Toolbar {...defaultProps} />)

      const fileInputs = container.querySelectorAll('input[type="file"]')
      expect(fileInputs).toHaveLength(2)
    })

    it('should accept image files', () => {
      const { container } = render(<Toolbar {...defaultProps} />)

      const imageInput = container.querySelector('input[accept="image/*"]')
      expect(imageInput).toBeInTheDocument()
    })

    it('should accept json files for presets', () => {
      const { container } = render(<Toolbar {...defaultProps} />)

      const presetInput = container.querySelector('input[accept=".json"]')
      expect(presetInput).toBeInTheDocument()
    })

    it('should allow multiple file selection', () => {
      const { container } = render(<Toolbar {...defaultProps} />)

      const imageInput = container.querySelector('input[accept="image/*"]')
      expect(imageInput).toHaveAttribute('multiple')
    })
  })

  describe('interactions', () => {
    it('should have button that references file input', () => {
      render(<Toolbar {...defaultProps} />)

      // Verify button exists - the actual click behavior requires a real ref
      const button = screen.getByRole('button', { name: /Select Image/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('bg-blue-600')
    })

    it('should call onFileSelect when file is selected', async () => {
      const onFileSelect = vi.fn()
      const { container } = render(<Toolbar {...defaultProps} onFileSelect={onFileSelect} />)

      const input = container.querySelector('input[accept="image/*"]') as HTMLInputElement

      // Create a mock file
      const file = new File(['test'], 'test.png', { type: 'image/png' })
      Object.defineProperty(input, 'files', {
        value: [file]
      })

      // Trigger change event
      input.dispatchEvent(new Event('change', { bubbles: true }))

      expect(onFileSelect).toHaveBeenCalled()
    })

    it('should call onPresetFileSelect when preset file is selected', async () => {
      const onPresetFileSelect = vi.fn()
      const { container } = render(<Toolbar {...defaultProps} onPresetFileSelect={onPresetFileSelect} />)

      const input = container.querySelector('input[accept=".json"]') as HTMLInputElement

      // Create a mock file
      const file = new File(['{}'], 'presets.json', { type: 'application/json' })
      Object.defineProperty(input, 'files', {
        value: [file]
      })

      // Trigger change event
      input.dispatchEvent(new Event('change', { bubbles: true }))

      expect(onPresetFileSelect).toHaveBeenCalled()
    })
  })

  describe('styling', () => {
    it('should have blue button styling', () => {
      render(<Toolbar {...defaultProps} />)

      const button = screen.getByRole('button', { name: /Select Image/i })
      expect(button).toHaveClass('bg-blue-600')
    })

    it('should have hidden file inputs', () => {
      const { container } = render(<Toolbar {...defaultProps} />)

      const fileInputs = container.querySelectorAll('input[type="file"]')
      fileInputs.forEach(input => {
        expect(input).toHaveClass('hidden')
      })
    })
  })
})
