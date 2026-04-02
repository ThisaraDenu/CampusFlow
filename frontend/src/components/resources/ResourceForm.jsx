import React, { useState } from 'react'

export function ResourceForm({ initialData, onSubmit, onCancel, isEditing = false }) {
  const [formData, setFormData] = useState(
    initialData || {
      name: '',
      type: 'LECTURE_HALL',
      capacity: 10,
      location: '',
      availabilityStart: '08:00',
      availabilityEnd: '18:00',
      status: 'ACTIVE',
      description: '',
      imageUrl: '',
    },
  )

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value, 10) || 0 : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-sm border border-campus-gray-200 p-6 max-w-3xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-campus-gray-700 mb-1">
            Resource Name *
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-campus-gray-700 mb-1">
            Resource Type *
          </label>
          <select
            name="type"
            required
            value={formData.type}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors bg-white"
          >
            <option value="LECTURE_HALL">Lecture Hall</option>
            <option value="LABORATORY">Laboratory</option>
            <option value="MEETING_ROOM">Meeting Room</option>
            <option value="EQUIPMENT">Equipment</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-campus-gray-700 mb-1">
            Capacity (People) *
          </label>
          <input
            type="number"
            name="capacity"
            required
            min="1"
            value={formData.capacity}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
          />
        </div>

        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-campus-gray-700 mb-1">
            Location *
          </label>
          <input
            type="text"
            name="location"
            required
            value={formData.location}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-campus-gray-700 mb-1">
            Availability Start *
          </label>
          <input
            type="time"
            name="availabilityStart"
            required
            value={formData.availabilityStart}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-campus-gray-700 mb-1">
            Availability End *
          </label>
          <input
            type="time"
            name="availabilityEnd"
            required
            value={formData.availabilityEnd}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-campus-gray-700 mb-1">
            Status *
          </label>
          <select
            name="status"
            required
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors bg-white"
          >
            <option value="ACTIVE">Active</option>
            <option value="OUT_OF_SERVICE">Out of Service</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-campus-gray-700 mb-1">
            Image URL
          </label>
          <input
            type="url"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
          />
        </div>

        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-campus-gray-700 mb-1">
            Description *
          </label>
          <textarea
            name="description"
            required
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors resize-none"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-campus-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 text-campus-gray-700 hover:bg-campus-gray-100 rounded-lg transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-sm"
        >
          {isEditing ? 'Save Changes' : 'Create Resource'}
        </button>
      </div>
    </form>
  )
}

