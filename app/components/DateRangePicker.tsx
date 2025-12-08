'use client'

import { useState } from 'react'

export type TimeRange = 'all' | 'last24h' | 'today' | 'custom'

interface DateRangePickerProps {
    selectedRange: TimeRange
    onRangeChange: (range: TimeRange) => void
    customStartDate?: string
    customEndDate?: string
    onCustomDatesChange?: (startDate: string, endDate: string) => void
}

export default function DateRangePicker({
    selectedRange,
    onRangeChange,
    customStartDate,
    customEndDate,
    onCustomDatesChange,
}: DateRangePickerProps) {
    const ranges: { value: TimeRange; label: string }[] = [
        { value: 'all', label: 'All Time' },
        { value: 'last24h', label: 'Last 24 hours' },
        { value: 'custom', label: 'Custom Range' },
    ]

    return (
        <div className="space-y-4">
            {/* Tab Buttons */}
            <div className="flex flex-wrap gap-2">
                {ranges.map((range) => (
                    <button
                        key={range.value}
                        onClick={() => onRangeChange(range.value)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${selectedRange === range.value
                            ? 'bg-primary-500 text-white shadow-md'
                            : 'bg-white text-neutral-600 border border-neutral-200 hover:border-primary-300 hover:bg-primary-50'
                            }`}
                    >
                        {range.label}
                    </button>
                ))}
            </div>

            {/* Custom Date Inputs */}
            {selectedRange === 'custom' && (
                <div className="bg-white rounded-lg border border-neutral-200 p-4 animate-slide-up">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={customStartDate || ''}
                                onChange={(e) =>
                                    onCustomDatesChange?.(e.target.value, customEndDate || '')
                                }
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={customEndDate || ''}
                                onChange={(e) =>
                                    onCustomDatesChange?.(customStartDate || '', e.target.value)
                                }
                                className="input-field"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
